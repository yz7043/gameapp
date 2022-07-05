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
class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`
        <div>Playground</div>
            `);
        this.hide();
        this.root.$ac_game.append(this.$playground);
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
}
class AcGame{
    constructor(id){
        this.id = id;
        this.$ac_game = $('#'+id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }
    start(){}
}
