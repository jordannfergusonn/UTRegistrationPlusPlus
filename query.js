// import jquery TODO not sure if this is needed
/*var script = document.createElement('script');
script.src = '/node_modules/jquery/dist/jquery.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);*/

/* DATA LOAD AND PREPROCESS */
var professors = {};
$.ajax({
	url: "http://www.utregplusplus.com/query.php",
	dataType: "json",
	method: "POST",
	data: {
		type: "professors",
		view: "json"
	},
	success: function(results){
		professors = results;
	},
	failure: function(error){
		alert("Call to our database failed with error: " + error);
	}
});

var courses = {};
$.ajax({
	url: "http://www.utregplusplus.com/query.php",
	dataType: "json",
	method: "POST",
	data: {
		type: "courses",
		view: "json"
	},
	success: function(results){
		courses = results;
	},
	failure: function(error){
		alert("Call to our database failed with error: " + error);
	}
});

class Lookup{
	constructor(entry){
		this.fi = entry[0];
		this.fn = entry[1];
		this.mi = entry[2];
		this.mn = entry[3];
		this.li = entry[4];
		this.ln = entry[5];
		this.id = entry[6];
	}
	matches(firstname, middlename, lastname){
		return this.fn == firstname && this.mn == middlename && this.ln == lastname ? this.id : -1;
	}
}

var lookups = [];
/*$.ajax({
	url: "dataExtraction/profIDLookup.csv",
	dataType: "text",
	success: function(results){
		let lines = results.split("\n");
		lines.forEach(function(line){
			lookups.push(new Lookup(line.split(",")));
		});
	},
});*/

$.get("dataExtraction/profIDLookup.csv", function(data){
	let lines = data.split("\n");
	lines.forEach(function(line){
		lookups.push(new Lookup(line.split(",")));
	});
}, "text");


/* MAIN CLASS */
class Query{
	static allProfs(){
		return professors;
	}

	static allCourses(){
		return courses;
	}
	/* 
	 * A Query object is the central piece for accessing our data. Construst an object with a first, middle, and last name.
	 * Middle name can be blank, but an empty string still needs to be passed. From there, a lookup will be done based on our
	 * csv of professor id's (these id's were generated by us). Whether or not an id is found, any of the methods can still be
	 * used and return default values. "found" parameter of a Query object is a boolean describing if an id was found in the lookup.
	 */
	constructor(courseLink){
		var page;
		$.ajax({
			//type: "GET",
			url: courseLink,
			//dataType: "html",
			success: function(data){
				page = $($.parseHTML(data));				
			},
			failure: function(error){
				// TODO adjust to set default vals instead
				alert("Call to course link failed with error: " + error);
			}
		});
		this.textbookLink = page.find("a[target='_blank']").prop("href");
		this.description = page.find("#details").text();

		let nameString = page.find("td[data-th='Instructor']").text();
		let namePieces = nameString.trim().toUpperCase().split(",");
		this.ln = namePieces[0];
		namePieces = namePieces[1].trim().split(" ");
		this.fn = namePieces[0];
		this.mn = namePieces.length > 1 ? namePieces[1] : "";
		for(let lookup in lookups){
			let id = lookup.matches(this.fn, this.mn, this.ln);
			if(id > 0) break;
		}
		this.found = id > 0;
		this.profid = id;
	}

	// Returns a string of the department or an empty string if not found
	department(){
		return this.found ? professors[this.id]["department"] : "";
	}

	// Returns a dictionary of RMP information with the following keys: score, ratingcount, tid, link
	rmp(){
		var result = {};
		result["score"] = this.found ? professors[this.id]["rmpscore"] : -1;
		result["ratingcount"] = this.found ? professors[this.id]["rmpratingcount"] : -1;
		result["tid"] = this.found ? professors[this.id]["rmptid"] : -1;
		result["link"] = this.found && result["tid"] > 0 ? "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + result["tid"] : "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+texas+at+austin&queryoption=HEADER&query=" + professors[this.id]["firstname"] + "%20" + professors[this.id]["lastname"] + ";&facetSearch=true";
		return result;
	}

	// Return a string link to the ecis search page for the Query
	ecis(){
		return "http://utdirect.utexas.edu/ctl/ecis/results/index.WBX?&s_in_action_sw=S&s_in_search_type_sw=N&s_in_search_name=" + this.ln + "%20" + this.fn;
	}

	// Returns a boolean based on if professor has been accused of sexual misconduct
	sexualmisconduct(){
		return !this.found ? false : professors[this.id]["sexualmisconduct"] == "t";
	}

	// Returns an array of course dictionaries with the following keys: name, field, number, semester, profid, a3, a2, a1, b3, b2, b1, c3, c2, c1, d3, d2, d1, f
	courses(){
		return !this.found ? [] : courses[this.id];
	}

	fullName(){
		return this.fn + " " + (this.mn ? this.mn + " " : "") + this.ln;
	}

	textbookLink(){
		return this.textbookLink;
	}

	desc(){
		return this.department;
	}
}
