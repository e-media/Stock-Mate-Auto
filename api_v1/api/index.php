<?php
include 'db.php';
require 'Slim/Slim.php';
\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$app->get('/users','getUsers');
$app->get('/updates','getUserUpdates');
$app->post('/updates', 'insertUpdate');
$app->delete('/updates/delete/:update_id','deleteUpdate');
$app->get('/users/search/:query','getUserSearch');

//Vehicle Info
$app->get('/stock','getStock');
//$app->post('/stock/updates', 'insertStock');

$app->run();


########

function getStock() {
    $sql = "SELECT * FROM stock ORDER BY id DESC";
    try {
        $db = getDB();
        $stmt = $db->query($sql);
        $stock = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo '{"stock": ' . json_encode($stock) . '}';
    } catch(PDOException $e) {
        //error_log($e->getMessage(), 3, '/var/tmp/php.log');
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

/*
function insertStock() {
    $request = \Slim\Slim::getInstance()->request();
    $update = json_decode($request->getBody());
    $sql = "INSERT INTO stock (user_update, user_id_fk, created, ip) VALUES (:user_update, :user_id, :created, :ip)";
    try {
        $db = getDB();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("user_update", $update->user_update);
        $stmt->bindParam("user_id", $update->user_id);
        $time=time();
        $stmt->bindParam("created", $time);
        $ip=$_SERVER['REMOTE_ADDR'];
        $stmt->bindParam("ip", $ip);
        $stmt->execute();
        $update->id = $db->lastInsertId();
        $db = null;
        $update_id= $update->id;
        getUserUpdate($update_id);
    } catch(PDOException $e) {
        //error_log($e->getMessage(), 3, '/var/tmp/php.log');
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}


 *
 *
INSERT INTO `stockmateauto`.`stock` (`id`, `year_model`, `mm_code`, `veh_description`, `extra_fitted`, `speedo_reading`, `service_history`, `veh_colour`, `recon_cost`, `trade_value`, `retail_value`, `standin_value`, `location`, `image1`) VALUES ('', '2013', '25075718', 'Honda CR-V 2.2I D-Tec Exclusive Aut', 'Towbar', '50000', 'Full service history with agents', 'Blue', '1000', '375000', '421800', '390000', 'Montana', '');
*/

########

function getUsers() {
	$sql = "SELECT user_id,username,name,profile_pic FROM users ORDER BY user_id";
	try {
		$db = getDB();
		$stmt = $db->query($sql);  
		$users = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"users": ' . json_encode($users) . '}';
	} catch(PDOException $e) {
	    //error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getUserUpdates() {
	$sql = "SELECT A.user_id, A.username, A.name, A.profile_pic, B.update_id, B.user_update, B.created FROM users A, updates B WHERE A.user_id=B.user_id_fk  ORDER BY B.update_id DESC";
	try {
		$db = getDB();
		$stmt = $db->prepare($sql); 
		$stmt->execute();		
		$updates = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"updates": ' . json_encode($updates) . '}';
		
	} catch(PDOException $e) {
	    //error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getUserUpdate($update_id) {
	$sql = "SELECT A.user_id, A.username, A.name, A.profile_pic, B.update_id, B.user_update, B.created FROM users A, updates B WHERE A.user_id=B.user_id_fk AND B.update_id=:update_id";
	try {
        $db = getDB();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("update_id", $update_id);
        $stmt->execute();
        $updates = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo '{"updates": ' . json_encode($updates) . '}';

    } catch(PDOException $e) {
        //error_log($e->getMessage(), 3, '/var/tmp/php.log');
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function insertUpdate() {
	$request = \Slim\Slim::getInstance()->request();
	$update = json_decode($request->getBody());
	$sql = "INSERT INTO updates (user_update, user_id_fk, created, ip) VALUES (:user_update, :user_id, :created, :ip)";
	try {
		$db = getDB();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("user_update", $update->user_update);
		$stmt->bindParam("user_id", $update->user_id);
		$time=time();
		$stmt->bindParam("created", $time);
		$ip=$_SERVER['REMOTE_ADDR'];
		$stmt->bindParam("ip", $ip);
		$stmt->execute();
		$update->id = $db->lastInsertId();
		$db = null;
		$update_id= $update->id;
		getUserUpdate($update_id);
	} catch(PDOException $e) {
		//error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function deleteUpdate($update_id) {
   
	$sql = "DELETE FROM updates WHERE update_id=:update_id";
	try {
		$db = getDB();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("update_id", $update_id);
		$stmt->execute();
		$db = null;
		echo true;
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
	
}

function getUserSearch($query) {
	$sql = "SELECT user_id,username,name,profile_pic FROM users WHERE UPPER(name) LIKE :query ORDER BY user_id";
	try {
		$db = getDB();
		$stmt = $db->prepare($sql);
		$query = "%".$query."%";  
		$stmt->bindParam("query", $query);
		$stmt->execute();
		$users = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"users": ' . json_encode($users) . '}';
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}
?>