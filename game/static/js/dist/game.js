class AcGameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            Solo
        </div>
        <br/>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            Squard
        </div>
        <br/>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            Settings
        </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        this.start();
        this.hide();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi");
        });
        this.$settings.click(function(){
            console.log("click settings");
        })
    }

    show(){
        // show menu
        this.$menu.show();
    }
    hide(){
        // hide menu
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = []

class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false;
        this.timedelta = 0; // ms
    }

    start(){}

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
class GameMap extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start(){
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Particle extends AcGameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.move_length = move_length;
        this.eps = 1;
    }

    start(){}

    update(){
        if(this.speed < this.eps || this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, is_me){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;

        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.damage_x = 0
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.cur_skill = null;
        this.spent_time = 0;
        if(this.is_me){
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    set_photo(){
        if(this.is_me){
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }else{
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    update(){
        // AI start auto attack after 4 s per 5 s
        this.spent_time += this.timedelta / 1000;
        if(Math.random() < 1/300.0 && !this.is_me && this.spent_time > 4){
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta * 0.3/ 1000;
            let ty = player.y + player.speed * this.vy * this.timedelta * 0.3/ 1000;
            this.shoot_fireball(player.x, player.y);
        }
        if(this.damage_speed > 10){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else{
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me){
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }else{
                let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
                this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
            }
        }
        this.render();
    }

    render(){
        if(this.is_me){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, Math.PI*2, false);
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        }else{
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, Math.PI*2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){return false;});
        this.playground.game_map.$canvas.mousedown(function(e){
            if(e.which === 3){
                outer.move_to(e.clientX, e.clientY);
            }else if(e.which === 1){
                if(outer.cur_skill === "fireball"){
                    outer.shoot_fireball(e.clientX, e.clientY);
                    outer.cur_skill = null;
                }
            }
        })
        $(window).keydown(function(e) {
            if(e.which === 81){
                outer.cur_skill = "fireball";
                return false;
            }
        })
    }

    shoot_fireball(tx, ty){
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty-this.y, tx-this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height*0.01);

    }

    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage){
        // generate particle effects
        for(let i = 0; i < 20 + Math.random() * 5; i++){
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);

        }
        this.radius -= damage;
        if(this.radius < 10){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = this.speed * 10;
    }

    on_destroy(){
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this)
                this.playground.players.splice(i, 1);
        }
    }
}
class FireBall extends AcGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage){
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.1;
        this.radius = radius;
        this.damage = damage;
    }

    start(){}

    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }else{
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
            for(let i = 0; i < this.playground.players.length; i++){
                let player = this.playground.players[i];
                if(this.player !== player && this.is_collision(player)){
                    this.attack(player);
                }
            }
        }
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    is_collision(obj){
        return this.get_dist(obj.x, obj.y, this.x, this.y) < this.radius + obj.radius;
    }

    attack(player){
        let angle = Math.atan2(player.y-this.y, player.x-this.x);
        player.is_attacked(angle,this.damage);
        this.destroy();
    }
}
class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`
        <div class="ac-game-playground">
        </div>
            `);
        this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.players = [];
        this.players.push(new Player(this, this.width/3, this.height/2, this.height*0.05, "white", this.height*0.15, true))
        for(let i = 0; i < 5; i++){
            this.players.push(new Player(this, this.width/2, this.height/2, this.height*0.05, this.get_random_color(), this.height*0.15, false));
        }

        this.start();
    }

    start(){}

    update(){}

    show(){
        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }
}
class Settings{
    constructor(root){
        this.root = root;
        this.platform = "WEB_OS";
        this.username = "";
        this.photo = "";
        if(this.root.ac_os)
            this.platform = "AC_OS";
        this.$settings = $(`
        <div class="ac-game-settings">
            <div class="ac-game-settings-login">
               <div class="ac-game-settings-title">
                    Login
                </div>
                <div class="ac-game-settings-username">
                    <div class="ac-game-settings-item">
                        <input type="text" placeholder="Username"></input>
                    </div>
                </div>
                <div class="ac-game-settings-password">
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="Password"></input>
                    </div>
                </div>
                <div class="ac-game-settings-submit">
                    <div class="ac-game-settings-item">
                        <button>Login</button>
                    </div>
                </div>
                <div class="ac-game-settings-error-message">
                </div>
                <div class="ac-game-settings-option">Register</div>
                <br/>
                <div class="ac-game-settings-google">
                    <img width="30" src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"></img>
                    <div>Login With Google</div>
                </div>
            </div>

            <div class="ac-game-settings-register">
               <div class="ac-game-settings-title">
                    Register
                </div>
                <div class="ac-game-settings-username">
                    <div class="ac-game-settings-item">
                        <input type="text" placeholder="Username"></input>
                    </div>
                </div>
                <div class="ac-game-settings-password">
                    <div class="ac-game-settings-item ac-game-settings-password-first">
                        <input type="password" placeholder="Password"></input>
                    </div>
                </div>
                <div class="ac-game-settings-password">
                    <div class="ac-game-settings-item ac-game-settings-password-second">
                        <input type="password" placeholder="Confirm Password"></input>
                    </div>
                </div>
                <div class="ac-game-settings-submit">
                    <div class="ac-game-settings-item">
                        <button>Register</button>
                    </div>
                </div>
                <div class="ac-game-settings-error-message">
                </div>
                <div class="ac-game-settings-option">Login</div>
            </div>
        </div>
            `);
        this.root.$ac_game.append(this.$settings);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$register = this.$settings.find(".ac-game-settings-register");

        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-password button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-password button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");
        this.start();
    }

    start(){
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events(){
        this.add_listening_event_login();
        this.add_listening_event_register();
    }

    add_listening_event_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
    }

    add_listening_event_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
    }

    login(){
        // open login page
        this.$register.hide();
        this.$login.show();
    }

    register(){
        // show register page
        this.$login.hide();
        this.$register.show();
    }

    getinfo(){
        let outer = this;
        $.ajax({
            url: "http://app2694.acapp.acwing.com.cn/settings/getinfo",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                console.log(resp);
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.root.create_playground();
                    outer.hide();
                    outer.root.menu.show();
                }else{
                    outer.login();
                    //outer.register();
                }
            }
        });
    }

    hide(){
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }
}
export class AcGame{
    constructor(id, ac_os){
        this.id = id;
        this.ac_os = ac_os;
        this.$ac_game = $('#'+id);
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = null; //= new AcGamePlayground(this);
        this.start();
    }
    start(){}

    create_playground(){
        this.playground = new AcGamePlayground(this);
    }
}

