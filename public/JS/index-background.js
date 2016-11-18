function changeShadow(){

	var e = window.event;
	var x = e.pageX;
	var y = e.pageY

	var w = window.innerWidth/2;
	var h = window.innerHeight/2;

	var dx = w - x; 
	var dy = h - y;

	var d = 50;

	var alpha = 1 - (dx * dx + dy * dy) / (w*w + h*h);
	// var clr = Math.round(40 * alpha + 215);

	document.getElementById("big-logo").style.textShadow = 
		(dx/d + "px " + dy/d + "px " + "8px rgba(34,11,135," + alpha + ")");
	// document.getElementById("big-logo").style.color = 
	// 	("rgb("+ clr + "," + clr + "," + clr + ")");


}

document.onmousemove = changeShadow;