// LemmoNaDe
// 
// Copyright (C) 2014  Michael Rieppel <mrieppel at gmail dot com>
// 
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.


// SI/TI RULE CHECKING FUNCTIONS (LSL ONLY)
// ========================================

// Main SI/TI checking function
function ckSI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line(s) '+l.join(',')+']: '
	if(l.length!=(s.length-1)) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	if(s.length==1) {
		var x = match(parse(s[0]),t);
		if(!x[0]) {nope();}
		if(clash(x[1])) {nope();}
		if(d.length!=0) {throw flag+'dependencies are wrong.';}
	}
	if(s.length==2) {
		var x = match(parse(s[0]),tr[l[0]-1]);
		if(!x[0]) {nope();}
		var y = match(parse(s[1]),t);
		if(!y[0]) {nope();}
		if(clash(x[1].concat(y[1]))) {nope();}
		var a = dep[l[0]-1].join(',');
		if(d.join(',')!=a) {throw flag+'dependencies are wrong.';}
	}
	if(s.length==3) {
		var x = match(parse(s[0]),tr[l[0]-1]);
		if(!x[0]) {nope();}
		var y = match(parse(s[1]),tr[l[1]-1]);
		if(!y[0]) {nope();}
		var z = match(parse(s[2]),t);
		if(!z[0]) {nope();}
		if(clash(x[1].concat(y[1],z[1]))) {nope();}
		var a = dep[l[0]-1].concat(dep[l[1]-1]);
		var a = sorted(rmDup(a));
		if(d.join(',')!=a.join(',')) {throw flag+'dependencies are wrong.';}
	}
	function nope() {
		throw flag+'The formula being derived does not follow by '+r+'.';
	}
}

// Checks SI rules that involve equivalence (DeM, Imp, Neg-Imp, Dist) 
function ckSIbi(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l[0]+']: '
	if(l.length!=1) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	
	var m1 = match(parse(s[0]),t); // tests if target formula matches first part of sequent
	if(!m1[0]) {// if not
		m1 = match(parse(s[1]),t); // match target formula to second part of sequent
		var m2 = match(parse(s[0]),tr[l[0]-1]); // match source formula to first part of sequent
	} else {var m2 = match(parse(s[1]),tr[l[0]-1]);} // if yes, match source formula to second part of sequent
	if(!m1[0] || !m2[0]){nope();}
	if(clash(m1[1].concat(m2[1]))) {nope();}
	if(d.join(',')!=dep[l[0]-1].join(',')) {throw flag+'dependencies are wrong.'} 
	function nope() {
		throw flag+'The formula being derived does not follow by '+r+'.';
	}
}

// Checks SI(Com)
function ckCom(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l[0]+']: ';	
	if(l.length!=1){ 
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	var cns = ['&','v','<>'];
	var c1 = t[1]; // main binary connective
	var c2 = tr[l[0]-1][1]; // main binary connective in formula on rule line
	if(c1==undefined || c2==undefined || c1!=c2) {nope();}
	if(cns.indexOf(c1)<0) {throw flag+c1+' is not a commutative connective.';}
	var m1 = match(parse('(A'+c1+'B)'),t);
	var m2 = match(parse('(B'+c1+'A)'),tr[l[0]-1]);
	if(!m1[0] || !m2[0] || clash(m1[1].concat(m2[1]))) {nope();}
	if(d.join(',')!=dep[l[0]-1].join(',')) {throw flag+'dependencies are wrong.'} 
	function nope() {
		throw flag+'The formula being derived does not follow by '+r+'.';
	}
}

// Checks SI(SDN1) 
// Note that this (arguably) implements a more lax version of the rule than one
// might want.  E.g. it lets the user go directly from '~~AvB' to 'Av~~B', whereas
// one might want to require an intermediate step of 'AvB' in this case.
function ckSDN1(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l[0]+']: ';
	if(l.length!=1) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	var c = t[1]; // main binary connective
	var c2 = tr[l[0]-1][1]; // main binary connective in formula on rule line
	if(c==undefined || c2==undefined || c!=c2) {nope();}
	
	var templates = ['(A'+c+'B)','(~~A'+c+'B)','(A'+c+'~~B)','(~~A'+c+'~~B)'];
	var dmatch = get_match(templates,t); // will hold the match for the formula on the rule line
	var fmatch = get_match(templates,tr[l[0]-1]); // will hold the match for the formula being derive
	if(fmatch.length==0 || dmatch.length==0) {nope();}
	if(clash(fmatch[1].concat(dmatch[1]))) {nope();}
	
	if(d.join(',')!=dep[l[0]-1].join(',')) {throw flag+'dependencies are wrong.';}
	function nope() {
		throw flag+'The formula being derived does not follow by '+r+'.';
	}
}

// Checks SI(SDN2)
// As with ckSDN1, arguably implements a more lax version of the rule
function ckSDN2(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l[0]+']: ';
	if(l.length!=1) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	var c = t[1][1]; // main binary connective
	var c2 = tr[l[0]-1][1][1]; // main binary connective in formula on rule line
	if(c==undefined || c2==undefined || c!=c2 || t[0]!='~' || tr[l[0]-1][0]!='~') {nope();}
	
	var templates = ['~(A'+c+'B)','~(~~A'+c+'B)','~(A'+c+'~~B)','~(~~A'+c+'~~B)'];
	var dmatch = get_match(templates,t); // will hold the match for the formula on the rule line
	var fmatch = get_match(templates,tr[l[0]-1]); // will hold the match for the formula being derive
	if(fmatch.length==0 || dmatch.length==0) {nope();}
	if(clash(fmatch[1].concat(dmatch[1]))) {nope();}
	
	if(d.join(',')!=dep[l[0]-1].join(',')) {throw flag+'dependencies are wrong.';}
	function nope() {
		throw flag+'The formula being derived does not follow by '+r+'.';
	}
}

// Helper for ckSDN1 and ckSDN2.  Takes an array of templates and a tree and tries
// matching the tree to each of the templates.  Returns the match() output if there
// is a match and an empty array [] otherwise.
function get_match(templates,tree) {
	var m = [];
	for(var i=0;i<templates.length;i++) {
		var x = match(parse(templates[i]),tree);
		if(x[0]) {m = x;}
	}
	return m;
}

// String -> [String]
// Extracts the SI sequent (as an array) from the 'value' attribute of the selected 
// rule (see the html <option> elements).  E.g. from 'SI(MT):(A>B),~B,~A' will return 
// ['(A>B)','~B','~A']
function getSeq(s) {
	var o = '';
	var i = 0;
	if(s.indexOf(':')<0) {return [];}
	while(s[i]!=':') {i++;}
	o = s.substr(i+1);
	o = o.replace(/ /g,'');
	return o.split(',');
}

// String -> String
// Extracts the SI rule name (as string) from the 'value' attribute of the selected
// rule.  E.g. from 'SI(MT):(A>B),~B,~A' will return 'SI(MT)'.
function getSeqHead(s) {
	var o = '';
	var i = 0;
	if(s.indexOf(':')<0) {return s;}
	while(s[i]!=':') {i++;}
	return s.substr(0,i);
}

// (Tree,Tree) -> [Boolean,Dictionary]
// Takes two trees,t1 and t2, where t1 is a "template" and t2 is to be matched
// against that template.  Returns an array with the first element 'true' if
// t2 matches the template, and the second element a "dictionary" of the matches.
// Returns an array with the first element 'false' if t2 doesn't match the template.
// E.g. if the template is "(A&B)", it will match any t2 that is a conjunction, and 
// give a dictionary with 'A' assigned to the first conjunct of t2 and 'B' assigned
// to the second conjunct of t2.  So match(parse("(A&B)"),parse("((F>G)&D)")) will
// return [true,[['A','(F>G)'],['B','D']]].
function match(t1,t2) {
	var a = ['A','B','C'];
	var out = [];
	function foo(x,y) {
		for(var i=0;i<x.length;i++) {
			if(x[i] instanceof Array && y[i] instanceof Array) {
				if(!foo(x[i],y[i])) {return false;}
			} else if(a.indexOf(x[i])>=0) {
				out.push([a[a.indexOf(x[i])],unparse(y)]);
			} else if (x[i]!=y[i]) {return false;}
		}
		return true;
	}
	var t = foo(t1,t2);
	if(t) {t=!clash(out);}
	return t ? [t,out] : [t,[]];
}

// Dictionary -> Boolean
// Checks a "dictionary" element of the match function to see if there are any clashes,
// where a clash occurs if the dictionary matches a certain template variable to different
// strings.  If there is a clash it returns 'true', if not it returns 'false'. E.g. 
// [['A','F>G'],['A','D']] contains a clash, but [['A','F>G'],['A','F>G']] does not.
function clash(ar) {
	var a1 = ar[0];
	ar = ar.slice(1);
	if(ar.length==0) {return false;}
	for(var i=0;i<ar.length;i++) {
		if(ar[i][0]==a1[0] && ar[i][1]!=a1[1]) {
			return true;
		}
	}
	return clash(ar);
}
