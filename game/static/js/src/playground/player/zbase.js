class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, charactor, username="", photo=""){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius
        this.color = color;
        this.speed = speed;
        this.charactor = charactor;
        this.eps = 0.01;

        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.damage_x = 0
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.9;
        this.username = username;
        this.photo = photo;
        this.is_alive = true;
        this.cur_skill = null;
        this.spent_time = 0;
        console.log(charactor, username, photo);
        this.fireballs = [];
        this.set_photo();
    }

    set_photo(){
        if(this.charactor !== "AI"){
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start(){
        if(this.charactor === "Me"){
            this.add_listening_events();
        }else if(this.charactor === "AI"){
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    update(){
        this.update_move();
        this.render();
    }

    update_move(){
        // AI start auto attack after 4 s per 5 s
        this.spent_time += this.timedelta / 1000;
        if(Math.random() < 1/300.0 && this.charactor === "AI" && this.spent_time > 0){
            if(this.playground.players.length > 1 ){
                let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
                for(let i = 0; i < 300; i++){
                    if(player === this)player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)]; 
                    else break;
                }
                this.shoot_fireball(player.x, player.y);
            }
        }
        if(this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else{
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(this.charactor === "AI"){
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }else{
                let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
                this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
            }
        }
    }

    render(){
        let scale = this.playground.scale;
        if(this.charactor !== "AI"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, Math.PI*2, false);
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0,  Math.PI*2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){return false;});
        this.playground.game_map.$canvas.mousedown(function(e){
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3){
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);
                if(outer.playground.mode === "Multi"){
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }else if(e.which === 1){
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if(outer.cur_skill === "fireball"){ 
                    let fireball = outer.shoot_fireball(tx, ty);
                    if(outer.playground.mode === "Multi"){
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
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
        if(!this.is_alive) return false;
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty-this.y, tx-this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);
        return fireball;
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
        if(this.radius < this.eps){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = this.speed * 10;
    }

    destroy_fireball(uuid){
        for(let i = 0; i < this.fireballs.length; i++){
            if(this.fireballs[i].uuid === uuid){
                this.fireballs[i].destroy();
                // this.fireballs.splice(i, 1);
                break;
            }
        }
    }

    on_destroy(){
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
                break;
            }
        }
        this.is_alive = false;
    }
}
