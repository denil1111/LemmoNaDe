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


// RULE CHECKING FUNCTIONS, QUANTIFICATIONAL LOGIC
// ===============================================

// EI: Existential Introduction
function ckEI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l[0]+']: ';
	if(l.length!=1) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	if(t.length!=2 || !isQ(t[0]) || t[0][1]!='E') {
		throw flag+'The formula being derived is not existentially quantified.'; 
	}
	var iv = isInst(t,frm[l[0]-1]);
	if(iv=='_') {
		throw flag+'The formula on line '+l[0]+' is not an instance of the formula being derived.';
	}
	var a = dep[l[0]-1].join(',');
	if(d.join(',')!=a) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the line the rule is applied to.';
	}
}

// EE: Existential Elimination
function ckEE(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to lines '+l.join(',')+']: ';
	if(l.length!=3) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	var ex = l[0]-1;
	if(tr[ex].length!=2 || !isQ(tr[ex][0]) || tr[ex][0][1]!='E') {
		throw flag+'The first rule line must be an existentially quantified formula.';
	}
	var ass = l[1]-1;
	var iv = isInst(tr[ex],frm[ass]);
	if(rul[ass]!='Assumption' || iv=='_') {
		throw flag+'The second rule line is either not an assumption, or not an instance of the existential formula on the first rule line.';
	}
	var cl = l[2]-1;
	if(frm[cl]!=f) {
		throw flag+'The formula being derived must match the formula on the third rule line.';
	}
	var freevars = [];
	for(var i=0;i<dep[cl].length;i++) {
		if((dep[cl][i]-1)!=ass) {
			freevars = freevars.concat(freeVars(tr[dep[cl][i]-1]));
		}
	}
	freevars = freevars.concat(freeVars(tr[cl]));
	freevars = freevars.concat(freeVars(tr[ex]));
	if(freevars.indexOf(iv)>=0) {
		throw flag+'Generalizability Failure.  The constant \''+iv+'\' used in creating the instance on line '+(ass+1)+' occurs in either (i) the original existential on line '+(ex+1)+', or (ii) the formula on line '+(cl+1)+' or (iii) one of the dependencies of line '+(cl+1)+' (other than '+(ass+1)+').';
	}
	var a = dep[ex].concat(dep[cl]);
	a = rmDup(a);
	if(a.indexOf(ass+1)>=0) {a.splice(a.indexOf(ass+1),1);}
	a = sorted(a);
	if(d.join(',')!=a.join(',')) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the first and third rule lines, an eliminate the the number of the assumption on the second rule line.';
	}	
}

// AI: Universal Introduction
function ckAI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l[0]+']: ';
	if(l.length!=1) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	if(t.length!=2 || !isQ(t[0]) || t[0][1]!='A') {
		throw flag+'The formula being derived is not universally quantified.';
	}
	var iv=isInst(t,frm[l[0]-1]);
	if(iv=='_') {
		throw flag+'The formula on the line the rule is being applied to is not an instance of the universal being derived.';
	}
	var freevars = freeVars(t);
	if(freevars.indexOf(iv)>=0) {
		throw flag+'Every occurrence of the constant \''+iv+'\' in line '+l[0]+' has to be replaced with the variable \''+t[0][2]+'\' bound by the quantifier being introduced.';
	}
	freevars=[];
	for(var i=0;i<dep[l[0]-1].length;i++) {
		freevars = freevars.concat(freeVars(tr[dep[l[0]-1][i]-1]));
	}
	if(freevars.indexOf(iv)>=0) {
		throw flag+'Generalizability Failure.  The constant \''+iv+'\' being generalized on occurs in one of the dependencies of line '+l[0]+'.';
	}
	if(d.join(',')!=dep[l[0]-1].join(',')) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the line the rule is being applied to.';
	}
}

// AE: Universal Elimination
function ckAE(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l[0]+']: ';
	if(l.length!=1) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	if(tr[l[0]-1].length!=2 || !isQ(tr[l[0]-1][0]) || tr[l[0]-1][0][1]!='A') {
		throw flag+'The formula the rule is being applied to is not universally quantified.';
	}
	var iv = isInst(tr[l[0]-1],f);
	if(iv=='_') {
		throw flag+'The formula being derived is not an instance of the universally quantified formula on line '+l[0]+'.';
	}
	var a = dep[l[0]-1].join(',');
	if(d.join(',')!=a) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the line the rule is applied to.';
	}
}

// IDI: Identity Introduction
function ckIDI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+']: ';
	if(l.length!=0) {
		throw flag+'This rule should not be applied to any lines.'
	}
	if(t.length!=3 || t[1]!='=' || t[0]!=t[2]) {
		throw flag+'The formula entered is not of the form \'t=t\'.';
	}
	if(d.length!=0) {
		throw flag+'Lines introduced by =I should have no dependencies.';
	}
}

// IDE: Identity Elimination
function ckIDE(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to lines '+l.join(',')+']: ';
	if(l.length!=2) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	if(tr[l[0]-1].length!=3 || tr[l[0]-1][1]!='=') {
		throw flag+'The first rule line needs to be an identity.'
	}
	if(!checkID(tr[l[0]-1],tr[l[1]-1],f)) {
		throw flag+'The formula being derived does not follow by '+r+'.'
	}
	var a = dep[l[0]-1].concat(dep[l[1]-1]);
	a = sorted(rmDup(a));
	if(d.join(',')!=a.join(',')) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the two lines the rule is being applied to.';
	}
}

// SI(QS): Quantifier Shift
function ckQS(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying SI(QS) to line '+l[0]+']: ';
	if(l.length!=1) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	var rl = l[0]-1;
	if(t.length!=2 || t[1].length!=2 || tr[rl].length!=2 || tr[rl][1].length!=2) {
		nope();
	}
	if(isU(tr[rl][0]) && isQ(tr[rl][1][0])) {
		var rest = unparse(tr[rl][1][1]);
		var oq = tr[rl][1][0];
		var nq = flip(oq);
		var frm = nq+'~'+rest;
		if(f!=frm) {nope();}
		
	} else if(isQ(tr[rl][0]) && isU(tr[rl][1][0])) {
		var rest = unparse(tr[rl][1][1]);
		var oq = tr[rl][0];
		var nq = flip(oq);
		var frm = '~'+nq+rest;
		if(f!=frm) {nope();}
	} else {nope();}
	if(d.join(',')!=dep[rl].join(',')) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the line the rule is being applied to.';
	}
	function nope() {
		throw flag+'The formula being derived does not follow by '+r+'.'
	}
	function flip(q) {
		var dic = {A: 'E',E: 'A'};
		return q[0]+dic[q[1]]+q[2]+q[3];
	}
}

// SI(AV): Alphabetic Variants
function ckAV(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying SI(AV) to line '+l[0]+']: ';
	if(l.length!=1) {
		throw flag+'The rule is being applied to an inappropriate number of lines.';
	}
	if(!isAV(tr[l[0]-1],frm[l[0]-1],f)) {
		throw flag+'The formula being derived is not a single variable alphabetic variant of the formula on line '+l[0]+'.' 
	}
	if(d.join(',')!=dep[l[0]-1].join(',')) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the line the rule is being applied to.';
	}
}


// Tree -> Tree
// Takes a parse tree of a quantified formula and returns a string template for 
// creating instances (with '_' where the instantial variable/constant is to go).
// So e.g. the parse tree of "(Ex)(Fx>Gxz)" will return a tree of "(F_>G_z)"
function mkTmp(ar) {
	var v = ar[0][2];
	return mk(ar[1]);
	function mk(a) {
		if(a.length==2 && isQ(a[0])) {
			if(a[0][2]==v) {
				return [a[0],a[1]];
			} else {
				return [a[0],mk(a[1])];
			}
		} else if(a.length==2 && isU(a[0])) {
			return [a[0],mk(a[1])];
		} else if(a.length==3 && isB(a[1])) {
			return [mk(a[0]),a[1],mk(a[2])];
		} else {
			return replace(v,a);
		}
	}
	function replace(x,ls) {
		var out = [];
		for(var i=0;i<ls.length;i++) {
			if(ls[i]==x) {out.push('_');} else {out.push(ls[i]);}
		}
		return out;
	}
}

// (Tree,String) -> Char
// Takes a parse tree of a quantified formula and a string to determine if the string
// is an instance of the quantified formula.  If so returns the char of the instantial
// variable/constant; if not, returns '_'.
// NOTE: this will return '_' if the quantifier was vacuous, as in e.g. '(Ax)(Fa>Ga)',
// since there is no instantial variable in such cases.
function isInst(t,s) {
	var tmp = mkTmp(t);
	var b = blockedVars(tmp);
	var stmp = unparse(tmp);
	if(stmp.length!=s.length) {return '_';};
	if(stmp.indexOf('_')<0) {return '_';}; // vacuous quantifier
	var iv = s[stmp.indexOf('_')];
	if(b.indexOf(iv)>=0) {return '_';}
	return s==stmp.replace(/_/g,iv) ? iv : '_';
}
 
// Tree -> [Char]
// Takes a parse tree and returns an array containing all the free variables/constants
// in that parse tree.
function freeVars(ar) {
	function mk(a,v) {
		if(a.length==2 && isQ(a[0])) {
			v.push(a[0][2]);
			return mk(a[1],v);
		} else if(a.length==2 && isU(a[0])) {
			return mk(a[1],v);
		} else if(a.length==3 && isB(a[1])) {
			return mk(a[0],v).concat(mk(a[2],v));
		} else {
			var out = [];
			for(var i=0;i<a.length;i++) {
				if(/[a-z]/.test(a[i]) && (v.indexOf(a[i])<0)) {
					out.push(a[i]);
				}
			}
			return out;
		}
	}
	return mk(ar,[]);
}

// (Tree,Tree,Wff) -> Boolean
// Takes the parse tree of an identity statement, the parse tree of a formula 1, and a 
// formula 2 to determine if you can get to the formula 2 from formula 1 by substituting
// one or more (not necessarily all!) occurrences of the first constant from the identity 
// with the second constant from the identity.
function checkID(id,t1,f2) {
	var f1 = unparse(t1);
	if(f2==f1) {return false;}
	if(f2.length!=f1.length) {return false;}
	var dic = [id[0],id[2]];
	function mk(a,v) {
		if(a.length==2 && isQ(a[0])) {
			v.push(a[0][2]);
			return a[0]+mk(a[1],v);
		} else if(a.length==2 && isU(a[0])) {
			return a[0]+mk(a[1],v);
		} else if(a.length==3 && isB(a[1])) {
			return '('+mk(a[0],v)+a[1]+mk(a[2],v)+')';
		} else {
			var out = '';
			for(var i=0;i<a.length;i++) {
				if(a[i]==dic[0] && v.indexOf(a[i])==(-1)) {
					out = out+'_';
				} else {out = out+a[i];}
			}
			return out;
		}
	}
	var tmp = mk(t1,[]);
	if(tmp.indexOf('_')==(-1)) {return false;}
	for(var i=0;i<tmp.length;i++) {
		if(tmp[i]=='_') {
			if(f2[i]!=dic[0] && f2[i]!=dic[1]) {
				return false;
			}
		} else if(tmp[i]!=f2[i]) {return false;}
	}
	return true;
}

// (Tree,String,String) -> Boolean
// Takes a parse tree of a quantified formula, the quantified formula f1 of which it is
// the tree, and a formula f2, and determines if f2 is an alphabetic variant (AV) of f1.
// FOR SI(AV)
function isAV(tree,f1,f2) {
	if(f1.length!=f2.length) {return false;}
	var avlst = mkAVList(tree);
	var v = '';
	for(var i=0;i<avlst.length;i++) {
		v = f2[avlst[i][1].indexOf('_')];
		if(f2==avlst[i][1].replace(/_/g,v) && avlst[i][0].indexOf(v)<0) {
			return true;
		}
	}
	return false;
}

// Tree -> [[Char],String]
// Takes a tree and returns a list of all the AV templates for the tree (i.e. templates 
// for creating alphabetic variants of the formula encoded by the tree).  Each AV 
// template is given as a pair, the first member of which is an array of "blocked 
// variables" (cannot be used to create AV's on pain of unwanted capture), and the second
// member of which is a string version of the actual AV template.
// FOR SI(AV)
function mkAVList(tree) {
	var loc = getQLoc(tree);
	var out = [];
	var x = '';
	var b = [];
	for(var i=0;i<loc.length;i++) {
		x = mkAVtmp(getTreeAt(tree,loc[i]));
		b = blockedVars(x[1]).concat(freeVars(x[1]));
		x = insertTmp(tree,strAVtmp(x),loc[i]);
		out.push([b,x]);
	}
	return out;
}

// Tree -> [[Int]]
// Takes a parse tree and returns an array of the "locations" of the quantified
// sub formulas in the tree (locations themselves being arrays of ints).
// FOR SI(AV)
function getQLoc(tree) {
	var loc = [];
	gt(tree,[]);
	return loc;
	function gt(a,y) {
		if(a.length==2 && isQ(a[0])) {
			loc.push(y.slice(0));
			y.push(1);
			gt(a[1],y.slice(0));
		} else if(a.length==2 && isU(a[0])) {
			y.push(1);
			gt(a[1],y.slice(0));
		} else if(a.length==3 && isB(a[1])) {
			y.push(0);
			gt(a[0],y.slice(0));
			y.pop();
			y.push(2);
			gt(a[2],y.slice(0));
		}
	}
}

// Tree -> Tree
// Takes a tree of a quantified formula and returns an AV template for that tree, itself
// a tree.
// FOR SI(AV)
function mkAVtmp(tree) {
		return [tree[0][0]+tree[0][1]+'_'+tree[0][3],mkTmp(tree)];
}

// Tree -> String
// Takes an AV template and creates a string version of it.
// FOR SI(AV)
function strAVtmp(avtmp) {
	return avtmp[0]+unparse(avtmp[1]);
}

// ([Int],Tree) -> Tree
// Takes a "location" (output of getQLoc) and a tree and returns the subtree at
// the location in question.
// FOR SI(AV)
function getTreeAt(tree,loc) {
	for(var i=0;i<loc.length;i++) {
		tree = tree[loc[i]];
	}
	return tree;
}

// Tree -> [Char]
// Takes an instance template, generated by either mkTmp or mkAVtmp, and returns a list
// of the variables that can't be used to create instances, on pain of unwanted capture
// by some quantifier further down the tree.
// NOTE: this function expects the "complement" of a quantifier, i.e. the element at 
// tree[1] of the parse tree of a quantified formula, with the quantifier left off. 
// So when calling this with an AV  template, you have to actually pass 
// just the element at tmp[1] of the AV template.
function blockedVars(tmp) {
	blocked = [];
	gt(tmp);
	return blocked;
	function gt(t) {
		if(t.length==2&&isQ(t[0])) {
			if(hasblank(t[1])) {
				blocked.push(t[0][2]);
			}
		} else if(t.length==2&&isU(t[0])) {
			gt(t[1]);
		} else if(t.length==3&&isB(t[1])) {
			gt(t[0]);
			gt(t[2]);
		}
	}
	function hasblank(a) {
		test = false;
		for(var i=0;i<a.length;i++) {
			if(a[i] instanceof Array) {
				test = test || hasblank(a[i]);
			} else {
				test = test || a[i]=='_';
			}
		}
		return test;
	}
}

// (Tree,String,[Int]) -> String
// Takes a parse tree, a string version of an AV template (output of strAVtmp), and a 
// location, and returns the formula that you get by taking the formula represented by 
// the parse tree and replacing the subformula at the given location with the strAVtmp.
// FOR SI(AV)
function insertTmp(tree,savtmp,loc) {
	return go(tree,[])
	function go(ar,l) {
		if(smLoc(l,loc)) {return savtmp;}
		if(ar.length==2 && (isQ(ar[0]) || isU(ar[0]))) {
			return ar[0]+go(ar[1],l.concat([1]));
		}
		if(ar.length==3 && isB(ar[1])) {
			return '('+go(ar[0],l.concat([0]))+ar[1]+go(ar[2],l.concat([2]))+')';
		}
		else {
			return ar.join('');
		}
	}
	function smLoc(l1,l2) {
		if(l1.length!=l2.length) {return false;}
		for(var i=0;i<l1.length;i++) {
			if(l1[i]!=l2[i]) {return false;}
		}
		return true;
	}	
}