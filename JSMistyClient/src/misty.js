var request =  require('request'); 

export class Robot {
    constructor(ip) {
        this.ip = ip;

        function change_LED(red, green, blue) {
            request.post('http://' + this.ip + '/api/led', JSON = { "red": red, "green": green, "blue": blue });
        }
    }
}