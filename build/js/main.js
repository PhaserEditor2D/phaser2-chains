/*jslint vars: true, devel: true bitwise: true */
/*global $, PHASER_UNITS, PHASER_EXAMPLES, escape */
function Main() {
    'use strict';
    
    function repl(s, a, b) {		
        if (s.replace) {
            return s.replace(a, b);
        }
        return s.toString();
    }

    this.run = function () {
        var self = this;
        this.update_viewers();
        $('#search').keyup(function (ctx) {
            self.update_viewers();
        });

        this.bookmarks = [];

        if (window.localStorage.bookmarks) {
            this.bookmarks = JSON.parse(window.localStorage.bookmarks);
            this.update_bookmarks();
        }

        $('#add_bookmark').click(function () {
            var query = $('#search').val();
            if (query.trim().length > 0) {
                self.bookmarks.push(query);
                window.localStorage.bookmarks = JSON.stringify(self.bookmarks);
            }
            self.update_bookmarks();
        });

        $('#maximize').click(function () {
            $('#maximize,#title').hide();
        });
        if (window.location.search.indexOf('embedded') !== -1) {
            $('#maximize,#title').hide();
            $('#installations').hide();
        }

        $('#layout').click(function () {
            self.do_layout((self.layout_id + 1) % 3);
        });

        if (window.location.search.indexOf('horizontal-layout') !== -1) {
            this.do_layout(2);
        } else {
            this.do_layout(0);
        }
    };

    this.do_layout = function (layout) {
        this.layout_id = layout;
        var tip = '<div style="padding:2em;" class="member-help">select a method chain to see the help.</div>';
        var html = '<table class="center-table">';
        switch (layout) {
        case 0:
            html += '<tr>';
            html += '   <td style="width:50%">';
            html += '       <span id="method-chains-title" class="section-title">Method Chains</span>';
            html += '       <div id="chain-list" class="chain-list"/>';
            html += '   </td>';
            html += '   <td style="width:50%">';
            html += '       <span id="examples-title" class="section-title">Examples</span>';
            html += '       <div id="example-list" class="example-list"/>';
            html += '   </td>';
            html += '</tr>';
            html += '<tr>';
            html += '   <td style="width:100%" colspan="2">';
            html += '       <span class="section-title">Help</span>';
            html += '       <div id="help" class="help-horizontal">' + tip + '</div>';
            html += '   </td>';
            html += '</tr>';
            break;
        case 1:
            html += '<tr>';
            html += '   <td style="width:50%">';
            html += '       <span id="method-chains-title" class="section-title">Method Chains</span>';
            html += '       <div id="chain-list" class="chain-list"/>';
            html += '   </td>';
            html += '   <td style="width:50%" rowspan="2">';
            html += '       <span class="section-title">Help</span>';
            html += '       <div id="help" class="help-vertical">' + tip + '</div>';
            html += '   </td>';
            html += '</tr>';
            html += '<tr>';
            html += '   <td style="width:50%;height:100%">';
            html += '       <span id="examples-title" class="section-title">Examples</span>';
            html += '       <div id="example-list" class="example-list"/>';
            html += '   </td>';
            html += '</tr>';
            break;
        case 2:
            html += '<tr>';
            html += '   <td style="width:33%">';
            html += '       <span id="method-chains-title" class="section-title">Method Chains</span>';
            html += '       <div id="chain-list" class="chain-list"/>';
            html += '   </td>';
            html += '   <td style="width:33%" rowspan="2">';
            html += '       <span class="section-title">Help</span>';
            html += '       <div id="help" class="help-vertical">' + tip + '</div>';
            html += '   </td>';
            html += '   <td style="width:34%;height:100%">';
            html += '       <span id="examples-title" class="section-title">Examples</span>';
            html += '       <div id="example-list" class="example-list"/>';
            html += '   </td>';
            html += '</tr>';
            break;
        }
        html += '</table>';

        var old_help_html = $('#help').html();
        $('#center-panel').html(html);
        this.update_viewers();
        $('#help').html(old_help_html);
    };

    /**
     * Update the bookmarks.
     */
    this.update_bookmarks = function () {
        var self = this;
        var i, html;
        html = '';
        for (i = 0; i < this.bookmarks.length; i += 1) {
            html += '<span raw-link=true class="raw-link bookmark link">' + this.bookmarks[i] + '</span><span bookmark-del="' + i + '" class="del-img"></span>';
        }
        $('#bookmarks').html(html);
        this.connect_links();
        $('.del-img').click(function () {
            var i = $(this).attr('bookmark-del');
            self.bookmarks.splice(i, 1);
            window.localStorage.bookmarks = JSON.stringify(self.bookmarks);
            self.update_bookmarks();
        });
    };

    /**
     * Read the docgen files and build the chains.
     */
    this.build_doc_data = function () {
        // do not build it twice
        if (this.phaser_data) {
            return;
        }

        var units = PHASER_UNITS;
        var map = {};

        // build plain chains for all types
        var i, name;
        for (i = 0; i < units.length; i += 1) {
            var unit = units[i];
            name = unit['class'].name;
            map[name] = unit;
        }

        var chains = [];
        this.phaser_data = {
            map: map,
            chains: chains
        };

        this.build_chains('Phaser.Game', chains, 0, 3);


        for (i = 0; i < units.length; i += 1) {
            name = units[i]['class'].name;
            if (name !== 'Phaser.Game') {
                this.build_chains(name, chains, 0, 2);
            }
        }

        // sort data

        var count_dots = function (s) {
            var i, n;
            n = 0;
            for (i = 0; i < s.length; i += 1) {
                if (s.charAt(i) === '.') {
                    n += 1;
                }
            }
            return n;
        };

        chains.sort(function (a, b) {
            if (a.depth !== b.depth) {
                return a.depth - b.depth;
            }


            var a_phaser = a.chain.indexOf('Phaser') === 0;
            var b_phaser = b.chain.indexOf('Phaser') === 0;

            if (a_phaser !== b_phaser) {
                return a_phaser ? -1 : 1;
            }

            a_phaser = a.type.indexOf('Phaser') === 0;
            b_phaser = b.type.indexOf('Phaser') === 0;

            if (a_phaser !== b_phaser) {
                return a_phaser ? -1 : 1;
            }

            var a_type_weight = count_dots(a.type);
            var b_type_weight = count_dots(b.type);
            if (a_type_weight !== b_type_weight) {
                return (a_type_weight - b_type_weight);
            }

            return 0;
        });
    };

    this.build_chains = function (class_name, chains, current_depth, depth, prefix) {
        if (current_depth === depth) {
            return;
        }

        var unit = this.phaser_data.map[class_name];

        if (unit === undefined) {
            return;
        }

        if (prefix === undefined) {
            prefix = class_name;
        }

        var i, j, k, type, name, chain, chain_display;

        // properties

        var prop_list = unit.properties['public'].concat(unit.properties['protected']);


        for (i = 0; i < prop_list.length; i += 1) {
            var prop = prop_list[i];
			
			
			//FIXME: no idea why this is happening!
			if (prop === undefined) {
				continue;
			}
			
			
            var prop_types = prop.type;
            for (j = 0; j < prop_types.length; j += 1) {
                type = prop_types[j];
                name = prop.name;
                chain = prefix + '.' + name;
                chain_display = chain + ' : ' + type + ';';
                chains.push({
                    chain: chain,
                    chain_display: chain_display,
                    type: type,
                    decl_type: class_name,
                    member: name,
                    depth: current_depth,
                    is_property: true,
                    property_obj: prop
                });
                this.build_chains(type, chains, current_depth + 1, depth, chain);
            }
        }

        // constants

        var const_list = unit.consts;
        for (i = 0; i < const_list.length; i += 1) {
            var cons = const_list[i];
			
			//FIXME: no idea why this is happening!
			if (cons === undefined) {
				continue;
			}
			
            name = cons.name;
            if (name) {
                type = cons.type;
                chain = prefix + '.' + name;
                chain_display = chain + ' : ' + type + ';';
                chains.push({
                    chain: chain,
                    chain_display: chain_display,
                    type: type,
                    decl_type: class_name,
                    member: name,
                    depth: current_depth,
                    is_const: true,
                    const_obj: cons
                });
            }
        }

        // methods

        var method_list = unit.methods['public'].concat(unit.methods['protected']);
        for (i = 0; i < method_list.length; i += 1) {
            var method = method_list[i];
			
			//FIXME: no idea why this is happening!
			if (method === undefined) {
				continue;
			}
			
            var method_types = [];
            if (method.returns) {
                method_types = method.returns.types;
            }
            if (method_types.length === 0) {
                method_types = ['void'];
            }
            for (j = 0; j < method_types.length; j += 1) {
                type = method_types[j];
                name = method.name;
                chain = prefix + '.' + name + '(';
                var params = method.parameters;
                for (k = 0; k < params.length; k += 1) {
                    if (k > 0) {
                        chain += ', ';
                    }
                    chain += params[k].name;
                }
                chain += ')';

                chain_display = chain + ' : ' + type + ';';
                chains.push({
                    chain: chain,
                    chain_display: chain_display,
                    type: type,
                    decl_type: class_name,
                    member: name,
                    depth: current_depth,
                    is_property: false,
                    method_obj: method
                });
            }
        }
    };

    this.matches = function (query_split, line, result) {
        var k, j;
        var start = -1;
        var len = 0;
        var last = 0;
        var line_lowercase = line.toLowerCase();
        for (k = 0; k < query_split.length; k += 1) {
            var q = query_split[k];
            if (q !== '') {
                j = line_lowercase.indexOf(q, last);
                if (j === -1) {
                    start = -1;
                    break;
                } else {
                    if (start === -1) {
                        start = j;
                    }
                    len = j - start + q.length;
                    last = j + len;
                }
            }
        }
        if (start !== -1) {
            result[0] = line.substr(0, start); // prefix
            result[1] = line.substr(start, len); // matching
            result[2] = line.substr(start + len, line.length - start - len); // posfix
            return true;
        }
        return false;
    };

    this.update_viewers = function () {
        this.build_doc_data();
        this.update_examples_viewer();
        this.update_chains_viewer();
    };

    this.update_examples_viewer = function () {
        var i, line, line_text, linenum, file, display_line;
        var lines = PHASER_EXAMPLES.lines;
        var filelist = PHASER_EXAMPLES.filelist;
        var result = [null, null, null];
        var query = $('#search').val().toLowerCase();
        var count = 0;
        var html = '';
        if (query.length >= 3) {
            var query_split = query.split('*');
            for (i = 0; i < filelist.length; i += 1) {
                file = filelist[i];
                if (this.matches(query_split, file, result)) {
                    display_line = result[0] + '<span class="highlight-example">' + result[1] + '</span>' + result[2];
                    html += '<div example-line="' + i + '" class="example-list-item">';
                    html += '<a target="_blank" href="https://github.com/photonstorm/phaser-examples/blob/master/';
                    if (file.indexOf('labs') === 0) {
                        html += file + '" class="example-link" style="float:left">';
                    } else {
                        html += 'examples/' + file + '" class="example-link" style="float:left">';
                    }
                    html += display_line + '</a>';
                    html += '</div>';
                    count += 1;
                }
                if (count > 200) {
                    break;
                }
            }

            for (i = 0; i < lines.length; i += 1) {
                line = lines[i];
                line_text = line[0];
                linenum = line[1] + 1;
                file = filelist[line[2]];
                if (this.matches(query_split, line_text, result)) {
                    display_line = result[0] + '<span class="highlight-example">' + result[1] + '</span>' + result[2];
                    html += '<div example-line="' + i + '" class="example-list-item">';
                    html += '<span class="example-line">' + display_line + '</span>';
                    html += '<a target="_blank" href="https://github.com/photonstorm/phaser-examples/blob/master/';
                    
                    if (file.indexOf('labs') !== 0) {
                        html += 'examples/';
                    }
                    html += file + '#L' + linenum + '" class="example-link">' + file + ' [' + linenum + ']</a>';
                    html += '</div>';
                    count += 1;
                }
                if (count > 200) {
                    break;
                }
            }
        }
        $('#examples-title').html(count > 200 ? 'Examples (200+)' : 'Examples (' + count + ')');
        if (html.length === 0) {
            html = '<span style="padding:2em;display:inline-block;">examples not found...</span>';
        }
        $('#example-list').html(html);
    };

    this.update_chains_viewer = function () {
        var i, chain, chain_list, j, k;
        var max = 200;
        var limit = max;
        var result = [null, null, null];
        var query = $('#search').val().toLowerCase();
        var query_split = query.split('*');

        chain_list = $('#chain-list');
        chain_list.html('');
        var html = '';
        if (query.length >= 3) {
            var truncated = false;
            var chains = this.phaser_data.chains;
            for (i = 0; i < chains.length; i += 1) {
                var item = chains[i];
                chain = item.chain_display;
                if (this.matches(query_split, chain, result)) {
                    limit -= 1;
                    if (limit < 0) {
                        truncated = true;
                        break;
                    }
                    var prefix = result[0];
                    var matching = result[1];
                    var posfix = result[2];
                    var img = item.is_property || item.is_const ? 'icon-field' : 'icon-method';
                    img = '<span class="' + img + '"></span>';
                    chain = prefix + '<span class="highlight">' + matching + '</span>' + posfix;
                    html += '<div chain-id="' + i + '" + class="chain-list-item depth-' + item.depth + '">' + img + chain + '</div>';
                }
            }
            $('#method-chains-title').html('Method Chains (' + (truncated ? max + '+' : max - limit) + ')');
        }
        if (html === '') {
            html = '<span style="padding:2em;display:inline-block;">chains not found...</span>';
        }
        chain_list.html(html);

        this.connect_chain_list_events();
    };

    this.connect_chain_list_events = function () {
        var self = this;

        $('.chain-list-item').dblclick(function () {
            var chain_id = $(this).attr('chain-id');
            var chain = self.phaser_data.chains[chain_id].chain;
            $('#search').val(chain);
        });

        $('.chain-list-item').click(function () {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
            var chain_id = $(this).attr('chain-id');
            var chain_item = self.phaser_data.chains[chain_id];
            if (chain_item.is_property) {
                self.show_property_help(chain_item);
            } else if (chain_item.is_const) {
                self.show_const_help(chain_item);
            } else {
                self.show_method_help(chain_item);
            }

            self.connect_links();
        });
    };


    this.show_const_help = function (chain_item) {
        var cls = chain_item.decl_type;
        var cls_info = this.phaser_data.map[cls];
        var member = chain_item.member;
        var type = chain_item.type;
        var const_obj = chain_item.const_obj;
        var html, j, i, types;
        html = '';
        html += '<pre style="white-space: pre-wrap;word-wrap:break-word">';
        var all_help, help;
        if (cls_info['class'].help) {
            all_help = repl(cls_info['class'].help, /\\n/g, '\n');
            i = all_help.indexOf('\n');
            if (i > 0) {
                help = all_help.substr(0, i);
                help += '... <a id="show-more-help" href="#">(Show more)</a>';
            } else {
                help = all_help;
            }

            html += '<span id="class-help" class="member-help">' + help + '</span>\n\n';
        }

        html += '<span style="color:purple">class</span> <span class="link">' + cls_info['class'].name + '</span>';
        if (cls_info['class']['extends']) {
            html += ' <span style="color:purple">extends</span> <span class="link">' + cls_info['class']['extends'] + '</span>';
        }
        html += ' {\n';
        if (const_obj.help) {
            html += '\n    <span class="member-help">' + repl(const_obj.help, /\\n/g, '\n    ') + '</span>\n\n';
        } else if (const_obj.inlineHelp) {
            html += '\n    <span class="member-help">' + repl(const_obj.inlineHelp, /\\n/g, '\n    ') + '</span>\n\n';
        }

        html += '\n    const ' + type + ' <b>' + member + '</b>;\n';
        html += '}\n';
        html += '\n<a href="http://docs.phaser.io/' + cls + '.html#' + member + '" target="_black">(docs.phaser.io)</a>';
        html += '</pre>';

        $('#help').html(html);

        $('#show-more-help').click((function (help) {
            return function () {
                $('#class-help').html(help);
            };
        }(all_help)));
    };


    this.show_property_help = function (chain_item) {
        var cls = chain_item.decl_type;
        var cls_info = this.phaser_data.map[cls];
        var member = chain_item.member;
        var prop = chain_item.property_obj;
        var html, j, i, types;
        types = '';
        for (j = 0; j < prop.type.length; j += 1) {
            if (j > 0) {
                types += ',';
            }
            types += '<span class="link">' + prop.type[j] + '</span>';
        }
        html = '';
        html += '<pre style="white-space: pre-wrap;word-wrap:break-word">';
        var all_help, help;
        if (cls_info['class'].help) {
            all_help = repl(cls_info['class'].help, /\\n/g, '\n');
            i = all_help.indexOf('\n');
            if (i > 0) {
                help = all_help.substr(0, i);
                help += '... <a id="show-more-help" href="#">(Show more)</a>';
            } else {
                help = all_help;
            }

            html += '<span id="class-help" class="member-help">' + help + '</span>\n\n';
        }

        html += '<span style="color:purple">class</span> <span class="link">' + cls_info['class'].name + '</span>';
        if (cls_info['class']['extends']) {
            html += ' <span style="color:purple">extends</span> <span class="link">' + cls_info['class']['extends'] + '</span>';
        }
        html += ' {\n';
        if (prop.help) {
            html += '\n    <span class="member-help">' + repl(prop.help, /\\n/g, '\n    ') + '</span>\n\n';
        } else if (prop.inlineHelp) {
            html += '\n    <span class="member-help">' + repl(prop.inlineHelp, /\\n/g, '\n    ') + '</span>\n\n';
        }

        html += '    ' + (prop.readOnly ? 'readonly ' : '') + types + ' <b>' + member + '</b>;\n';
        html += '}\n';
        html += '\n<a href="http://docs.phaser.io/' + cls + '.html#' + member + '" target="_black">(docs.phaser.io)</a>';
        html += '</pre>';

        $('#help').html(html);

        $('#show-more-help').click((function (help) {
            return function () {
                $('#class-help').html(help);
            };
        }(all_help)));
    };

    this.show_method_help = function (chain_item) {
        var cls = chain_item.decl_type;
        var member = chain_item.member;
        var cls_info = this.phaser_data.map[cls];
        var i, html, j, types;

        var method = chain_item.method_obj;
        html = '';


        html += '<pre style="white-space: pre-wrap;word-wrap:break-word">';

        var all_help, help;
        if (cls_info['class'].help) {
            all_help = repl(cls_info['class'].help, /\\n/g, '\n');
            i = all_help.indexOf('\n');
            if (i > 0) {
                help = all_help.substr(0, i);
                help += '... <a id="show-more-help" href="#">(Show more)</a>';
            } else {
                help = all_help;
            }

            html += '<span id="class-help" class="member-help">' + help + '</span>\n\n';
        }

        // class def
        html += '<span style="color:purple">class</span> <span class="link">' + cls_info['class'].name + '</span>';
        if (cls_info['class']['extends']) {
            html += ' <span style="color:purple">extends</span> <span class="link">' + cls_info['class']['extends'] + '</span>';
        }
        html += ' {\n';

        // method help
        if (method.help) {
            html += '\n    <span class="member-help">' + repl(method.help, /\\n/g, '\n    ') + '</span>';
        } else if (method.inlineHelp) {
            html += '\n    <span class="member-help">' + repl(method.inlineHelp, /\\n/g, '\n    ') + '</span>';
        }

        // help args
        var params = method.parameters;
        var param, k;
        for (j = 0; j < params.length; j += 1) {
            param = params[j];
            types = '';
            for (k = 0; k < param.type.length; k += 1) {
                if (k > 0) {
                    types += ',';
                }
				console.log(k + ' ' + JSON.stringify(param));
                types += '<span class="link">' + repl(repl(param.type[k], '<', '&lt;'), '>', '&gt;') + '</span>';
            }
            html += '\n\n        arg ';
            html += types + ' <b>' + param.name + '</b>';
            html += (param.optional ? ' (optional)' : '');
            html += (param['default'] === null || param['default'] === undefined ? '' : ' = ' + param['default']);
            html += '\n\n            <span class="member-help">' + param.help + '</span>';
        }

        // help return
        if (method.returns) {
            html += '\n\n        returns <span class="member-help">' + repl(method.returns.help, /\\n/g, '\n    ') + '</span>';
        }

        var method_types = '';
        if (method.returns) {
            var ret_types = method.returns.types;
            for (j = 0; j < ret_types.length; j += 1) {
                if (method_types) {
                    method_types += ',';
                }
                method_types += '<span class="link">' + ret_types[j] + '</span>';
            }
        } else {
            method_types = '<span style="color:purple">void</span>';
        }

        var params_html = '';
        for (i = 0; i < params.length; i += 1) {
            if (i > 0) {
                params_html += ', ';
            }
            params_html += params[i].name;
        }

        html += '\n\n    ' + method_types + ' <b>' + member + '</b>(' + params_html + ')\n';
        html += '}\n';
        html += '\n<a href="http://docs.phaser.io/' + cls + '.html#' + member + '" target="_black">(docs.phaser.io)</a>';
        html += '</pre>';

        $('#help').html(html);

        $('#show-more-help').click((function (help) {
            return function () {
                $('#class-help').html(help);
            };
        }(all_help)));
    };

    this.connect_links = function () {
        var self = this;
        $('.link').click(function () {
            var text = $(this).html();
            var i = text.indexOf('.');
            var contains_dot = i !== -1;
            var ends_with_dot = i === text.length - 1;
            if ($(this).attr('raw-link') !== 'true' && contains_dot && !ends_with_dot) {
                text += '.';
            }
            $('#search').val(text);
            self.update_viewers();
        });
    };
}