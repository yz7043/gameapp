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

