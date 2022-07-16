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
            outer.root.playground.show("Single");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("Multi");
        });
        this.$settings.click(function(){
            console.log("click settings");
            outer.root.settings.logout_on_remote();
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
