<?php
$target_dir = "../images/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;
$imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);



// Check file size
if ($_FILES["fileToUpload"]["size"] > 500000000000) {
    echo "Sorry, your file is too large.<br>";
    $uploadOk = 0;
}

echo "file Size : " . $_FILES["fileToUpload"]["size"]. "<br>";
echo "file name : " . $_FILES["fileToUpload"]["name"]. "<br>";
echo "file basename : " . basename($_FILES["fileToUpload"]["name"]) . "<br>";
echo "target dir : " . $target_dir. "<br>";
echo "target file : " . $target_file. "<br>";
echo "upload OK : " . $uploadOk. "<br>";
echo "file type : " . $imageFileType . "<br>";

echo "-------------------------------------------<br>";

echo $_SERVER['PHP_SELF'];
echo "<br>";
echo $_SERVER['SERVER_NAME'];
echo "<br>";
echo $_SERVER['HTTP_HOST'];
echo "<br>";
echo $_SERVER['HTTP_REFERER'];
echo "<br>";
echo $_SERVER['HTTP_USER_AGENT'];
echo "<br>";
echo $_SERVER['SCRIPT_NAME'];

/*
// Allow certain file formats
if($imageFileType != "stl" ) {

    echo "Sorry, only stl files are allowed. your type is : $target_file <br> ";

    $uploadOk = 0;
}
// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    echo "Sorry, your file was not uploaded.<br>";
// if everything is ok, try to upload file
} else {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        echo "The file ". basename( $_FILES["fileToUpload"]["name"]). " has been uploaded.<br>";
    } else {
        echo "Sorry, there was an error uploading your file.<br>";
    }
}

*/

?>
