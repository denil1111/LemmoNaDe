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


function disp(id) {
	var menu_items = ['appm','repm','expm','refm'];
	var menu_contents = ['prbt','appt','rept','expt','reft'];
	var proof_started = cnt.length>0 || gls.length>0;
	for(var i=0;i<menu_items.length;i++) {
		document.getElementById(menu_items[i]).style.backgroundColor = '#DDDDDD';
	}
	for(var i=0;i<menu_contents.length;i++) {
		document.getElementById(menu_contents[i]).style.display='none';
	}
	var show_table = (id=='app' && !proof_started) ? 'prbt' : id+'t';
	document.getElementById(show_table).style.display = 'block';
	document.getElementById(id+'m').style.backgroundColor = 'white';
}

function showSI(id) {
	var d = {rul:'SI1', rulr:'SI2'};
	var el = document.getElementById(id);
	var x = document.getElementById(d[id]);
	if(el.options[el.selectedIndex].value == 'SI/TI') {
		x.style.display = 'block';
	} else {
		x.style.display = 'none';
	}
}

function exp(x) {
	var el = document.getElementById(x);
	var tr = document.getElementById(x+'trigger');
	var dic = {sync:'Syntax', srulc:'Rules for Sentential Logic', qrulc:'Rules for Quantificational Logic'};
	if(el.style.display=='none' || el.style.display=='' ) {
		el.style.display = 'block';
		tr.innerHTML = '[–] '+dic[x];
	} else {
		el.style.display = 'none';
		tr.innerHTML = '[+] '+dic[x];
	}	
}