/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2018 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 *  
 */

/*global Ext:false */
/*global $:false */
/*global App:false */
/*global document:false */
/*global writeFiles:false */
/*global store:false */
/*global addBitmap:false */
Ext.namespace('addBitmap');
addBitmap.init = function () {
    "use strict";
    Ext.QuickTips.init();
    var me = this;
    me.form = new Ext.Panel({
        region: 'center',
        id: "addform",
        frame: false,
        bodyStyle: 'padding: 0',
        border: false,
        autoHeight: true,
        html: "<div id='shape_uploader'>" + __("You need Flash or a modern browser, which supports HTML5") + "</div>",
        afterRender: function () {
            var arr = [], ext = ["tif", "tiff", "ecw", "jpg", "tab"], srs, flag = false;
            $("#shape_uploader").pluploadQueue({
                runtimes: 'html5',
                url: '/controllers/upload/bitmap',
                max_file_size: '4000mb',
                chunk_size: '1mb',
                unique_names: true,
                urlstream_upload: true,
                init: {
                    UploadComplete: function (up, files) {
                        // *****
                        var count = 0;
                        (function iter() {
                            var e = arr[count];
                            if (arr.length === count) {
                                if (flag) {
                                    App.setAlert(App.STATUS_NOTICE, __("All files processed"));
                                    reLoadTree();
                                    writeFiles();
                                    writeMapCacheFile();
                                }
                                spinner(false);
                                return;
                            } else {
                                spinner(true, __("processing " + e.split(".")[0]));
                                flag = true;
                                $.ajax({
                                    url: '/controllers/upload/processbitmap',
                                    data: "srid=" + srs + "&file=" + e + "&name=" + e.split(".")[0],
                                    dataType: 'json',
                                    type: 'GET',
                                    success: function (response) {
                                        count = count + 1;
                                        if (!response.success) {
                                            Ext.MessageBox.alert(__('Failure'), __(response.message));
                                        }
                                        iter();
                                    },
                                    failure: function () {
                                        iter();
                                    }
                                });
                            }
                        }());
                        if (!flag) {
                            Ext.MessageBox.alert(__('Failure'), __("No files you uploaded seems to be recognized as a valid image format."));
                        }
                    },
                    FilesAdded: function (up, files) {
                        Ext.each(files, function (item) {
                            Ext.each(ext, function (e) {
                                if (item.name.split(".").reverse()[0].toLowerCase() === e) {
                                    arr.push(item.name);
                                }
                            });
                        });
                    },
                    BeforeUpload: function (up, file) {
                        srs = Ext.getCmp('srs').getValue();
                        up.settings.multipart_params = {
                            name: file.name
                        };
                    }
                }
            });
            window.setTimeout(function () {
                var e = $(".plupload_droptext");
                window.setTimeout(function () {
                    e.fadeOut(500).fadeIn(500);
                }, 1000);
                window.setTimeout(function () {
                    e.html(__("Image formats") + ": " + __("At the moment you can upload") + " .tif and .ecw");
                }, 1500);
            }, 200);
        },
        tbar: [
            'Epsg:',
            {
                width: 60,
                xtype: 'textfield',
                id: 'srs',
                value: window.gc2Options.epsg
            }
        ]
    });
    me.onSubmit = function (form, action) {
        var result = action.result;
        if (result.success) {
            store.load();
            App.setAlert(App.STATUS_NOTICE, __(result.message));
        } else {
            Ext.MessageBox.alert(__('Failure'), __(result.message));
        }
    };
};