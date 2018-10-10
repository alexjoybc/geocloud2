<?php
/**
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2018 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 *
 */

namespace app\models;

use app\inc\Model;

class User extends Model {
	public $user;
	function __construct($userId) {
		parent::__construct();
		$this->userId=$userId;
		$this->postgisdb="mapcentia";
	}
    public function getAll(){
        $query = "SELECT * FROM users WHERE email<>''";
        $res = $this->execQuery($query);
        $rows = $this -> fetchAll($res);
        if (!$this -> PDOerror) {
            $response['success'] = true;
            $response['data'] = $rows;
        } else {
            $response['success'] = false;
            $response['message'] = $this -> PDOerror;
        }
        return $response;
    }
	public function getData() {
        $domain = \app\conf\App::$param['domain'];
		$query = "SELECT screenname as userid, zone, '{$domain}' as host FROM users WHERE screenname = :sUserID";
		$res = $this -> prepare($query);
		$res -> execute(array(":sUserID" => $this->userId));
		$row = $this -> fetchRow($res);
        if (!$row['userid']) {
            $response['success'] = false;
            $response['message'] = "Userid not found";
            //$response['code'] = 406;
            return $response;
        }
		if (!$this -> PDOerror) {
			$response['success'] = true;
			$response['data'] = $row;
		} else {
			$response['success'] = false;
			$response['message'] = $this -> PDOerror;
		}
		return $response;
	}
}