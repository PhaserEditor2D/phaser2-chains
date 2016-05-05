/*jslint vars: true, devel: true bitwise: true */
/*global define,brackets,$ */
define(function (require, exports, module) {
    'use strict';
    
    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        AppInit = brackets.getModule("utils/AppInit");

    var SHOW_PHASERCHAINS = "com.boniatillo.phaserchains.execute";
    var panel;

    function log(s) {
        console.log("[com.boniatillo.phaserchains] " + s);
    }

    function handlePhaserChains() {
        if (panel.isVisible()) {
            panel.hide();
            CommandManager.get(SHOW_PHASERCHAINS).setChecked(false);
        } else {
            panel.show();
            CommandManager.get(SHOW_PHASERCHAINS).setChecked(true);
        }
    }

    AppInit.appReady(function () {

        log("Initializing com.boniatillo.phaserchains");

        CommandManager.register("Phaser Chains", SHOW_PHASERCHAINS, handlePhaserChains);

        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(SHOW_PHASERCHAINS, "Ctrl-I");

        var html = '';
        html += "<div id='phaserchains-panel' class='bottom-panel'>";
        html += "<iframe style='width:100%;height:100%;' src='http://phaserchains.boniatillo.com?embedded&horizontal-layout&brackets_0.0.2'></iframe></div>";
        panel = WorkspaceManager.createBottomPanel(SHOW_PHASERCHAINS, $(html), 200);

    });

});