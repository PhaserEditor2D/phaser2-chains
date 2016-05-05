# Phaser Chains

Phaser Chains is an alternative but improved place to browse the [Phaser](http://phaser.io) [API and docs](http://docs.phaser.io). With this service you don't need to navigate into the tree of the 
Phaser types and methods, you only need to write the method (or method chain) you are interested about and the matching Phaser API is shown, together with the documentation.

Try with:

```
game*shake
input*down
moveto
```

Note there is a panel with the matching Phaser examples. Keep an eye on that, it always shows interesting results.


Just try with the [Phaser Chains](http://phaserchains.boniatillo.com) website, but it is also available as [Brackets](http://brackets.io) extension and was embedded in the [Phaser official website](http://phaser.io/learn/chains).

This tool uses the Phaser Editor metadata.

### Integration with Brackets

You can install a Phaser Chains extension in Brackets, it is available in the Global Brackets Registery so you can open the Extension Manager and search for "Phaser Chains". One time the extension is installed, you can open (View > Phaser Chains) a bottom panel with Phaser Chains embedded in.

### Integration with Phaser Editor

Phaser Chains has a [native implementation](http://phasereditor.boniatillo.com/blog/quick-start/035-chains) in [Phaser Editor](http://phasereditor.boniatillo.com), actually, we use the metadata of the editor to build the Phaser Chains model.

### Integration with other editors

You can integrate Phaser Chains with any other editor containing a "web view". For example, Eclipse has an Internal Web Browser view, you can open it and request the URL:

```
http://phaserchains.boniatillo.com/?embedded&horizontal-layout&eclipse
```

It opens a webpage with a compact layout. So yo can do the same in any other editor or IDE. If the webpage is not displaying correctly, probably it is because the used browser (Internet Explorer?) is not compatible. Note the word ```&eclipse``` at the end of the URL. You should write there the name of your editor, in this way we can know the most used editors and provide better support for them in the future.