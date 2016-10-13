function SaveThumbnail(renderer)
{
	//var testCanvas = m_renderer.domElement.toDataURL();
	var canvasData = renderer.domElement.toDataURL();
	var postData = "canvasData="+canvasData;
	//var debugConsole= document.getElementById("debugConsole");
	//debugConsole.value=canvasData;

	//alert("canvasData ="+canvasData );
	var ajax = new XMLHttpRequest();
	ajax.open("POST",'thumbnail.php',true);
	ajax.setRequestHeader('Content-Type', 'canvas/upload');
	//ajax.setRequestHeader('Content-TypeLength', postData.length);


	ajax.onreadystatechange=function()
	{
		if (ajax.readyState == 4)
		{
			//alert(ajax.responseText);
			// Write out the filename.
    	//document.getElementById("debugConsole").innerHTML="Saved as<br><a target='_blank' href='"+ajax.responseText+"'>"+ajax.responseText+"</a>";
		}
	}

	ajax.send(postData);
}
