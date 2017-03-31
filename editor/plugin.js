/**
 *
 * Simple plugin to create wordbuildgrid
 * @class wordbuildgrid
 * @extends EkstepEditor.basePlugin
 *
 * @author Gourav <gourav_m@tekditechnologies.com>
 * @fires object:modified
 */
EkstepEditor.basePlugin.extend({
    type: "org.ekstep.wordbuildgrid",
    initialize: function() {},
    /**
    *
    *   invoked by framework when instantiating plugin instance.
    *   Creates and adds wordbuildgrid shape to stage.
    *   @memberof wordbuildgrid
    */
    newInstance: function() {
        var props = this.convertToFabric(this.attributes),
        host = EkstepEditorAPI.getConfig('useProxyForURL') ? EkstepEditorAPI.getConfig('baseURL') : EkstepEditorAPI.getConfig('absURL');
        props.stroke = 1;
        props.strokeWidth = 2;
        props.strokeDashArray = [5, 5];
        props.fill = this.attributes.fill;
        if (this.attributes.type === 'roundrect') {
            this.editorObj = new fabric.Rect(props);
            this.addMedia({
                id: "org.ekstep.scribblepad.eraser",
                src: host + "/assets/public/content/1460624453530trash.png",
                assetId: "org.ekstep.scribblepad.eraser",
                type: "image",
                preload: true
            });
        }
    },
    /**
     *   update attributes with shape properties from editorObj.
     *
     *
     *   @memberof scribblePad
     */

    updateAttributes: function() {
        var instance = this;
        var dataList = { "radius": "radius", "opacity": "opacity", "stroke": "stroke", "stroke-width": "stroke-width", "scaleX": "scaleX", "scaleY": "scaleY" };
        if (instance) {
            EkstepEditorAPI._.forEach(dataList, function(val, key) {
                instance.attributes[key] = instance.editorObj.get(val);
            })
        }
    },
    /**
     *
     *   update editorObj properties on config change
     *
     *
     *   @memberof scribblePad
     */

    onConfigChange: function(key, value) {
        if (key === 'color') {
            this.editorObj.setFill(value);
            this.attributes.fill = value;
        }
        EkstepEditorAPI.render();
        EkstepEditorAPI.dispatchEvent('object:modified', { target: EkstepEditorAPI.getEditorObject() });
    },
    /**
     *   set scribblepad properties for ECML
     *  @override
     *  @returns {Object}
     *  ECML properties for scribblepad
     *   @memberof scribblePad
     */
    getAttributes: function() {
        var attr = this._super();
        delete attr.strokeDashArray;
        attr['stroke-width'] = 1;
        attr.thickness = 2;
        return attr;
    },
    /**
    *
    *   get config data plugin instance
    *   @returns {Object}
    *   config object
    *   @memberof scribblePad
    */
    getConfig: function() {
        var config = this._super();
        config.color = this.attributes.fill;
        config.opacity = this.attributes.opacity * 100;
        return config;
    }
});
//# sourceURL=wordbuildgridplugin.js
