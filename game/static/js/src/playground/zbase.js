class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`
        <div class="ac-game-playground">
        </div>
            `);
        this.hide();
        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    start(){
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });
    }

    update(){}

    show(mode){
        this.mode = mode;
        this.$playground.show();
        // this.width = this.$playground.width();
        // this.height = this.$playground.height();
        this.resize();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, "white", 0.15, "Me", this.root.settings.username, this.root.settings.photo)) // scale == height -> no more height
        let outer = this;
        if(mode === "Single"){
            for(let i = 0; i < 5; i++){
                this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "AI"));
            }
        }else{
            this.mps = new MultiplayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide(){
        this.$playground.hide();
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }


    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if(this.game_map) this.game_map.resize();
    }
}
