let AC_GAME_OBJECTS = []

class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false;
        this.timedelta = 0; // ms
        this.uuid = this.create_uuid();
    }

    start(){}

    create_uuid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }

    update(){}

    on_destroy(){}

    destroy(){
        this.on_destroy();
        for(let i = 0; i < AC_GAME_OBJECTS.length; i++){
            if(AC_GAME_OBJECTS[i] === this){
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
let last_timestamp;

let AC_GAME_ANIMATION = function(timestamp){
    for(let i = 0; i < AC_GAME_OBJECTS.length; i++){
        let obj = AC_GAME_OBJECTS[i]
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);
