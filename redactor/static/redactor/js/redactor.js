/*
	Redactor II
	Version 1.0.1
	Updated: October 13, 2015

	http://imperavi.com/redactor/

	Copyright (c) 2009-2015, Imperavi LLC.
	License: http://imperavi.com/redactor/license/

	Usage: $('#content').redactor();
*/

(function($)
{
	'use strict';

	if (!Function.prototype.bind)
	{
		Function.prototype.bind = function(scope)
		{
			var fn = this;
			return function()
			{
				return fn.apply(scope);
			};
		};
	}

	var uuid = 0;


	// Plugin
	$.fn.redactor = function(options)
	{
		var val = [];
		var args = Array.prototype.slice.call(arguments, 1);

		if (typeof options === 'string')
		{
			this.each(function()
			{
				var instance = $.data(this, 'redactor');
				var func;

				if (options.search(/\./) !== '-1')
				{
					func = options.split('.');
					if (typeof instance[func[0]] !== 'undefined')
					{
						func = instance[func[0]][func[1]];
					}
				}
				else
				{
					func = instance[options];
				}

				if (typeof instance !== 'undefined' && $.isFunction(func))
				{
					var methodVal = func.apply(instance, args);
					if (methodVal !== undefined && methodVal !== instance)
					{
						val.push(methodVal);
					}
				}
				else
				{
					$.error('No such method "' + options + '" for Redactor');
				}
			});
		}
		else
		{
			this.each(function()
			{
				$.data(this, 'redactor', {});
				$.data(this, 'redactor', Redactor(this, options));
			});
		}

		if (val.length === 0)
		{
			return this;
		}
		else if (val.length === 1)
		{
			return val[0];
		}
		else
		{
			return val;
		}

	};

	// Initialization
	function Redactor(el, options)
	{
		return new Redactor.prototype.init(el, options);
	}

	// Options
	$.Redactor = Redactor;
	$.Redactor.VERSION = '1.0';
	$.Redactor.modules = ['air', 'autosave', 'block', 'browser', 'buffer', 'build', 'button', 'caret', 'clean', 'code', 'core', 'dropdown',
						  'events', 'file', 'focus', 'image', 'indent', 'inline', 'insert', 'keydown', 'keyup',
						  'lang', 'line', 'link', 'linkify', 'list', 'modal', 'observe', 'paragraphize', 'paste', 'placeholder',
						  'progress', 'selection', 'shortcuts', 'toolbar', 'upload', 'uploads3', 'utils'];

	$.Redactor.settings = {};
	$.Redactor.opts = {

		// settings
		lang: 'en',
		direction: 'ltr',

		focus: false,
		focusEnd: false,

		clickToEdit: false,
		structure: false,

		tabindex: false,

		minHeight: false, // string
		maxHeight: false, // string

		maxWidth: false, // string

		plugins: false, // array
		callbacks: {},

		placeholder: false,

		linkify: true,
		enterKey: true,

		preClass: false, // string
		preSpaces: 4, // or false
		tabAsSpaces: false, // true or number of spaces
		tabKey: true,

		autosave: false, // false or url
		autosaveName: false,
		autosaveFields: false,

		imageUpload: null,
		imageUploadParam: 'file',
		dragImageUpload: true,

		fileUpload: null,
		fileUploadParam: 'file',
		dragFileUpload: true,

		s3: false,

		linkTooltip: true,
		linkProtocol: 'http',
		linkNofollow: false,
		linkSize: 50,

		toolbar: true,
		toolbarFixed: true,
		toolbarFixedTarget: document,
		toolbarFixedTopOffset: 0, // pixels
		toolbarExternal: false, // ID selector
		toolbarOverflow: false,
		toolbarCustom: false,

		air: false,

		formatting: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		formattingAdd: false,

		buttons: ['format', 'bold', 'italic', 'deleted', 'lists', 'image', 'file', 'link', 'horizontalrule'], // + 'underline'

		buttonsHide: [],
		buttonsHideOnMobile: [],

		script: true,

		// shortcuts
		shortcuts: {
			'ctrl+shift+m, meta+shift+m': { func: 'inline.removeFormat' },
			'ctrl+b, meta+b': { func: 'inline.format', params: ['bold'] },
			'ctrl+i, meta+i': { func: 'inline.format', params: ['italic'] },
			'ctrl+h, meta+h': { func: 'inline.format', params: ['superscript'] },
			'ctrl+l, meta+l': { func: 'inline.format', params: ['subscript'] },
			'ctrl+k, meta+k': { func: 'link.show' },
			'ctrl+shift+7':   { func: 'list.toggle', params: ['orderedlist'] },
			'ctrl+shift+8':   { func: 'list.toggle', params: ['unorderedlist'] }
		},
		shortcutsAdd: false,

		// private lang
		langs: {
			en: {

				"format": "Format",
				"image": "Image",
				"file": "File",
				"link": "Link",
				"bold": "Bold",
				"italic": "Italic",
				"deleted": "Strikethrough",
				"underline": "Underline",
				"bold-abbr": "B",
				"italic-abbr": "I",
				"deleted-abbr": "S",
				"underline-abbr": "U",
				"lists": "Lists",
				"link-insert": "Insert link",
				"link-edit": "Edit link",
				"link-in-new-tab": "Open link in new tab",
				"unlink": "Unlink",
				"cancel": "Cancel",
				"close": "Close",
				"insert": "Insert",
				"save": "Save",
				"delete": "Delete",
				"text": "Text",
				"edit": "Edit",
				"title": "Title",
				"paragraph": "Normal text",
				"quote": "Quote",
				"code": "Code",
				"heading1": "Heading 1",
				"heading2": "Heading 2",
				"heading3": "Heading 3",
				"heading4": "Heading 4",
				"heading5": "Heading 5",
				"heading6": "Heading 6",
				"filename": "Name",
				"optional": "optional",
				"unorderedlist": "Unordered List",
				"orderedlist": "Ordered List",
				"outdent": "Outdent",
				"indent": "Indent",
				"horizontalrule": "Line",
				"upload-label": "Drop file here or ",

				"accessibility-help-label": "Rich text editor"
			}
		},

		// private
		type: 'textarea', // textarea, div, inline, pre
		inline: false,
		buffer: [],
		rebuffer: [],
		inlineTags: ['a', 'span', 'strong', 'strike', 'b', 'u', 'em', 'i', 'code', 'del', 'ins', 'samp', 'kbd', 'sup', 'sub', 'mark', 'var', 'cite', 'small'],
		blockTags: ['pre', 'ul', 'ol', 'li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',  'dl', 'dt', 'dd', 'div', 'td', 'blockquote', 'output', 'figcaption', 'figure', 'address', 'section', 'header', 'footer', 'aside', 'article', 'iframe'],
		paragraphize: true,
		paragraphizeBlocks: ['table', 'div', 'pre', 'form', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dl', 'blockquote', 'figcaption',
							'address', 'section', 'header', 'footer', 'aside', 'article', 'object', 'style', 'script', 'iframe', 'select', 'input', 'textarea',
							'button', 'option', 'map', 'area', 'math', 'hr', 'fieldset', 'legend', 'hgroup', 'nav', 'figure', 'details', 'menu', 'summary', 'p'],
		emptyHtml: '<p>&#x200b;</p>',
		invisibleSpace: '&#x200b;',
		imageTypes: ['image/png', 'image/jpeg', 'image/gif'],
		userAgent: navigator.userAgent.toLowerCase(),
		observe: {
			dropdowns: []
		},
		regexps: {
			linkyoutube: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w.\-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig,
			linkvimeo: /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/,
			linkimage: /((https?|www)[^\s]+\.)(jpe?g|png|gif)(\?[^\s-]+)?/ig,
			url: /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ig
		}

	};

	// Functionality
	Redactor.fn = $.Redactor.prototype = {

		keyCode: {
			BACKSPACE: 8,
			DELETE: 46,
			UP: 38,
			DOWN: 40,
			ENTER: 13,
			SPACE: 32,
			ESC: 27,
			TAB: 9,
			CTRL: 17,
			META: 91,
			SHIFT: 16,
			ALT: 18,
			RIGHT: 39,
			LEFT: 37,
			LEFT_WIN: 91
		},

		// =init
		init: function(el, options)
		{
			this.$element = $(el);
			this.uuid = uuid++;

			this.loadOptions(options);
			this.loadModules();

			// click to edit
			if (this.opts.clickToEdit && !this.$element.hasClass('redactor-click-to-edit'))
			{
				return this.loadToEdit(options);
			}
			else if (this.$element.hasClass('redactor-click-to-edit'))
			{
				this.$element.removeClass('redactor-click-to-edit');
			}

			// block & inline test tag regexp
			this.reIsBlock = new RegExp('^(' + this.opts.blockTags.join('|' ).toUpperCase() + ')$', 'i');
			this.reIsInline = new RegExp('^(' + this.opts.inlineTags.join('|' ).toUpperCase() + ')$', 'i');

			// set up drag upload
			this.opts.dragImageUpload = (this.opts.imageUpload === null) ? false : this.opts.dragImageUpload;
			this.opts.dragFileUpload = (this.opts.fileUpload === null) ? false : this.opts.dragFileUpload;

			// formatting storage
			this.formatting = {};

			// load lang
			this.lang.load();

			// extend shortcuts
			$.extend(this.opts.shortcuts, this.opts.shortcutsAdd);

			// start callback
			this.core.callback('start');
			this.core.callback('startToEdit');

			// build
			this.start = true;
			this.build.start();

		},
		loadToEdit: function(options)
		{

			this.$element.on('click.redactor-click-to-edit', $.proxy(function()
			{
				this.initToEdit(options);

			}, this));

			this.$element.addClass('redactor-click-to-edit');

			return;
		},
		initToEdit: function(options)
		{
			$.extend(options.callbacks,  {
				startToEdit: function()
				{
					this.insert.node(this.selection.marker(), false);
				},
				initToEdit: function()
				{
					this.selection.restore();
					this.clickToCancelStorage = this.code.get();

					// cancel
					$(this.opts.clickToCancel).show().on('click.redactor-click-to-edit', $.proxy(function(e)
					{
						e.preventDefault();

						this.core.destroy();
						this.events.syncFire = false;
						this.$element.html(this.clickToCancelStorage);
						this.core.callback('cancel', this.clickToCancelStorage);
						this.events.syncFire = true;
						this.clickToCancelStorage = '';
						$(this.opts.clickToCancel).hide();
						$(this.opts.clickToSave).hide();
						this.$element.on('click.redactor-click-to-edit', $.proxy(function()
						{
							this.initToEdit(options);
						}, this));
						this.$element.addClass('redactor-click-to-edit');

					}, this));

					// save
					$(this.opts.clickToSave).show().on('click.redactor-click-to-edit', $.proxy(function(e)
					{
						e.preventDefault();

						this.core.destroy();
						this.core.callback('save', this.code.get());
						$(this.opts.clickToCancel).hide();
						$(this.opts.clickToSave).hide();
						this.$element.on('click.redactor-click-to-edit', $.proxy(function()
						{
							this.initToEdit(options);
						}, this));
						this.$element.addClass('redactor-click-to-edit');

					}, this));
				}

			});

			this.$element.redactor(options);
			this.$element.off('click.redactor-click-to-edit');

		},
		loadOptions: function(options)
		{
			this.opts = $.extend(
				{},
				$.extend(true, {}, $.Redactor.opts),
				$.extend(true, {}, $.Redactor.settings),
				this.$element.data(),
				options
			);
		},
		getModuleMethods: function(object)
		{
			return Object.getOwnPropertyNames(object).filter(function(property)
			{
				return typeof object[property] === 'function';
			});
		},
		loadModules: function()
		{
			var len = $.Redactor.modules.length;
			for (var i = 0; i < len; i++)
			{
				this.bindModuleMethods($.Redactor.modules[i]);
			}
		},
		bindModuleMethods: function(module)
		{
			if (typeof this[module] === 'undefined')
			{
				return;
			}

			// init module
			this[module] = this[module]();

			var methods = this.getModuleMethods(this[module]);
			var len = methods.length;

			// bind methods
			for (var z = 0; z < len; z++)
			{
				this[module][methods[z]] = this[module][methods[z]].bind(this);
			}
		},

		// =air
		air: function()
		{
			return {
				enabled: false,
				collapsed: function()
				{
					if (this.opts.air)
					{
						this.selection.get().collapseToStart();
					}
				},
				collapsedEnd: function()
				{
					if (this.opts.air)
					{
						this.selection.get().collapseToEnd();
					}
				},
				build: function()
				{
					if (this.utils.isMobile())
					{
						return;
					}

					this.button.hideButtons();
					this.button.hideButtonsOnMobile();

					if (this.opts.buttons.length === 0)
					{
						return;
					}

					this.$air = this.air.createContainer();

					this.air.append();
					this.button.$toolbar = this.$air;
					this.button.setFormatting();
					this.button.load(this.$air);


					this.core.editor().on('mouseup.redactor', this, $.proxy(function(e)
					{
						if (this.selection.text() !== '')
						{
							this.air.show(e);
						}
					}, this));

				},
				append: function()
				{
					this.$air.appendTo('body');
				},
				createContainer: function()
				{
					return $('<ul>').addClass('redactor-air').attr({ 'id': 'redactor-air-' + this.uuid, 'role': 'toolbar' }).hide();
				},
				show: function (e)
				{
					this.selection.removeMarkers();
					this.selection.save();
					this.selection.restore(false);

					$('.redactor-air').hide();

					var leftFix = 0;
					var width = this.$air.innerWidth();

					if ($(window).width() < (e.clientX + width))
					{
						leftFix = 200;
					}

					this.$air.css({
						left: (e.clientX - leftFix) + 'px',
						top: (e.clientY + 10 + $(document).scrollTop()) + 'px'
					}).show();

					this.air.enabled = true;
					this.air.bindHide();
				},
				bindHide: function()
				{
					$(document).on('mousedown.redactor-air.' + this.uuid, $.proxy(function(e)
					{
						var dropdown = $(e.target).closest('.redactor-dropdown').length;

						if ($(e.target).closest(this.$air).length === 0 && dropdown === 0)
						{
							var hide = this.air.hide(e);
							if (hide !== false)
							{
								this.selection.removeMarkers();
							}
						}

					}, this)).on('keydown.redactor-air.' + this.uuid, $.proxy(function(e)
					{
						var key = e.which;
						if ($(e.target).closest('#redactor-modal').length !== 0)
						{
							return;
						}

						if (key === this.keyCode.ESC)
						{
							this.selection.get().collapseToStart();
							this.selection.removeMarkers();
						}
						else if (key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE)
						{
							var sel = this.selection.get();
							var range = this.selection.range(sel);
							range.deleteContents();
							this.selection.removeMarkers();
						}
						else if (key === this.keyCode.ENTER)
						{
							this.selection.get().collapseToEnd();
							this.selection.removeMarkers();
						}

						if (this.air.enabled)
						{
							this.air.hide(e);
						}
						else
						{
							this.selection.get().collapseToStart();
							this.selection.removeMarkers();
						}


					}, this));
				},
				bindMousemoveHide: function()
				{
					$(document).on('mousemove.redactor-air.' + this.uuid, $.proxy(function(e)
					{
						if ($(e.target).closest(this.$air).length === 0)
						{
							this.air.hide(e);
						}

					}, this));

				},
				hide: function(e)
				{
					var ctrl = e.ctrlKey || e.metaKey || (e.shiftKey && e.altKey);
					if (ctrl)
					{
						return false;
					}

					this.button.setInactiveAll();
					this.$air.fadeOut(100);
					this.air.enabled = false;
					$(document).off('mousedown.redactor-air.' + this.uuid);

				}
			};
		},

		// =autosave
		autosave: function()
		{
			return {
				enabled: false,
				html: false,
				init: function()
				{
					if (!this.opts.autosave)
					{
						return;
					}

					this.autosave.enabled = true;
					this.autosave.name = (this.opts.autosaveName) ? this.opts.autosaveName : this.$textarea.attr('name');

				},
				is: function()
				{
					return this.autosave.enabled;
				},
				send: function()
				{
					if (!this.opts.autosave)
					{
						return;
					}

					this.autosave.source = this.code.get();

					if (this.autosave.html === this.autosave.source)
					{
						return;
					}

					// data
					var data = {};
					data.name = this.autosave.name;
					data[this.autosave.name] = this.autosave.source;
					data = this.autosave.getHiddenFields(data);

					// ajax
					var jsxhr = $.ajax({
						url: this.opts.autosave,
						type: 'post',
						data: data
					});

					jsxhr.done(this.autosave.success);
				},
				getHiddenFields: function(data)
				{
					if (this.opts.autosaveFields === false || typeof this.opts.autosaveFields !== 'object')
					{
						return data;
					}

					$.each(this.opts.autosaveFields, $.proxy(function(k, v)
					{
						if (v !== null && v.toString().indexOf('#') === 0)
						{
							v = $(v).val();
						}

						data[k] = v;

					}, this));

					return data;

				},
				success: function(data)
				{
					var json;
					try
					{
						json = $.parseJSON(data);
					}
					catch(e)
					{
						//data has already been parsed
						json = data;
					}

					var callbackName = (typeof json.error === 'undefined') ? 'autosave' :  'autosaveError';

					this.core.callback(callbackName, this.autosave.name, json);
					this.autosave.html = this.autosave.source;
				},
				disable: function()
				{
					this.autosave.enabled = false;

					clearInterval(this.autosaveTimeout);
				}
			};
		},

		// =block
		block: function()
		{
			return {
				format: function(tag, attr, value, type)
				{
					tag = (tag === 'quote') ? 'blockquote' : tag;

					this.block.tags = ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'];
					if ($.inArray(tag, this.block.tags) === -1)
					{
						return;
					}

					this.placeholder.remove();
					this.buffer.set();

					return (this.utils.isCollapsed()) ? this.block.formatCollapsed(tag, attr, value, type) : this.block.formatUncollapsed(tag, attr, value, type);
				},
				formatCollapsed: function(tag, attr, value, type)
				{
					this.selection.save();

					var block = this.selection.block();
					var currentTag = block.tagName.toLowerCase();
					if ($.inArray(currentTag, this.block.tags) === -1)
					{
						this.selection.restore();
						return;
					}

					if (currentTag === tag)
					{
						tag = 'p';
					}

					var replaced = this.utils.replaceToTag(block, tag);

					if (typeof attr === 'object')
					{
						type = value;
						for (var key in attr)
						{
							replaced = this.block.setAttr(replaced, key, attr[key], type);
						}
					}
					else
					{
						replaced = this.block.setAttr(replaced, attr, value, type);
					}

					this.selection.restore();
					this.block.removeInlineTags(replaced);

					return replaced;
				},
				formatUncollapsed: function(tag, attr, value, type)
				{
					this.selection.save();

					var replaced = [];
					var blocks = this.selection.blocks();
					var len = blocks.length;
					for (var i = 0; i < len; i++)
					{
						var currentTag = blocks[i].tagName.toLowerCase();

						if ($.inArray(currentTag, this.block.tags) !== -1)
						{
							var block = this.utils.replaceToTag(blocks[i], tag);

							if (typeof attr === 'object')
							{
								type = value;
								for (var key in attr)
								{
									block = this.block.setAttr(block, key, attr[key], type);
								}
							}
							else
							{
								block = this.block.setAttr(block, attr, value, type);
							}

							replaced.push(block);
							this.block.removeInlineTags(block);
						}
					}

					this.selection.restore();

					return replaced;
				},
				removeInlineTags: function(node)
				{
					node = node[0] || node;

					var tags = this.opts.inlineTags;
					var blocks = ['PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

					if ($.inArray(node.tagName, blocks) === - 1)
					{
						return;
					}

					if (node.tagName !== 'PRE')
					{
						var index = tags.indexOf('a');
						tags.splice(index, 1);
					}

					$(node).find(tags.join(',')).not('.redactor-selection-marker').contents().unwrap();
				},
				setAttr: function(block, attr, value, type)
				{
					if (typeof attr === 'undefined')
					{
						return block;
					}

					var func = (typeof type === 'undefined') ? 'replace' : type;

					if (attr === 'class')
					{
						block = this.block[func + 'Class'](value, block);
					}
					else
					{
						if (func === 'remove')
						{
							block = this.block[func + 'Attr'](attr, block);
						}
						else if (func === 'removeAll')
						{
							block = this.block[func + 'Attr'](attr, block);
						}
						else
						{
							block = this.block[func + 'Attr'](attr, value, block);
						}
					}

					return block;

				},
				getBlocks: function(block)
				{
					return (typeof block === 'undefined') ? this.selection.blocks() : block;
				},
				replaceClass: function(value, block)
				{
					return $(this.block.getBlocks(block)).removeAttr('class').addClass(value)[0];
				},
				toggleClass: function(value, block)
				{
					return $(this.block.getBlocks(block)).toggleClass(value)[0];
				},
				addClass: function(value, block)
				{
					return $(this.block.getBlocks(block)).addClass(value)[0];
				},
				removeClass: function(value, block)
				{
					return $(this.block.getBlocks(block)).removeClass(value)[0];
				},
				removeAllClass: function(block)
				{
					return $(this.block.getBlocks(block)).removeAttr('class')[0];
				},
				replaceAttr: function(attr, value, block)
				{
					block = this.block.removeAttr(attr, block);

					return $(block).attr(attr, value)[0];
				},
				toggleAttr: function(attr, value, block)
				{
					block = this.block.getBlocks(block);

					var self = this;
					var returned = [];
					$.each(block, function(i,s)
					{
						var $el = $(s);
						if ($el.attr(attr))
						{
							returned.push(self.block.removeAttr(attr, s));
						}
						else
						{
							returned.push(self.block.addAttr(attr, value, s));
						}
					});

					return returned;

				},
				addAttr: function(attr, value, block)
				{
					return $(this.block.getBlocks(block)).attr(attr, value)[0];
				},
				removeAttr: function(attr, block)
				{
					return $(this.block.getBlocks(block)).removeAttr(attr)[0];
				},
				removeAllAttr: function(block)
				{
					block = this.block.getBlocks(block);

					var returned = [];
					$.each(block, function(i,s)
					{
						if (typeof s.attributes === 'undefined')
						{
							returned.push(s);
						}

						var $el = $(s);
						var len = s.attributes.length;
						for (var z = 0; z < len; z++)
						{
							$el.removeAttr(s.attributes[z].name);
						}

						returned.push($el[0]);
					});

					return returned;
				}
			};
		},

		// =browser
		browser: function()
		{
			return {
				webkit: function()
				{
					return /webkit/.test(this.opts.userAgent);
				},
				ff: function()
				{
					return this.opts.userAgent.indexOf('firefox') > -1;
				},
				ie: function(v)
				{
					var ie;
					ie = RegExp('msie' + (!isNaN(v)?('\\s'+v):''), 'i').test(navigator.userAgent);
					if (!ie)
					{
						ie = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
					}
					return ie;
				}
			};
		},

		// buffer
		buffer: function()
		{
			return {
				set: function(type)
				{
					if (typeof type === 'undefined' || type === 'undo')
					{
						this.buffer.setUndo();
					}
					else
					{
						this.buffer.setRedo();
					}
				},
				setUndo: function()
				{
					this.selection.save();
					this.opts.buffer.push(this.core.editor().html());
					this.selection.restore();
				},
				setRedo: function()
				{
					this.selection.save();
					this.opts.rebuffer.push(this.core.editor().html());
					this.selection.restore();
				},
				getUndo: function()
				{
					this.events.stopDetect();
					this.core.editor().html(this.opts.buffer.pop());
					this.events.startDetect();

				},
				getRedo: function()
				{
					this.events.stopDetect();
					this.core.editor().html(this.opts.rebuffer.pop());
					this.events.startDetect();

				},
				add: function()
				{
					this.opts.buffer.push(this.core.editor().html());
				},
				undo: function()
				{
					if (this.opts.buffer.length === 0)
					{
						return;
					}

					this.buffer.set('redo');
					this.buffer.getUndo();

					this.selection.restore();

					setTimeout($.proxy(this.observe.load, this), 50);
				},
				redo: function()
				{
					if (this.opts.rebuffer.length === 0)
					{
						return;
					}

					this.buffer.set('undo');
					this.buffer.getRedo();

					this.selection.restore();

					setTimeout($.proxy(this.observe.load, this), 50);
				}
			};
		},

		// =build
		build: function()
		{
			return {
				start: function()
				{
					this.$editor = this.$element;

					// load
					if (this.build.isInline() || this.opts.inline)
					{
						this.opts.type = 'inline';
						this.opts.inline = true;
						this.opts.linkify = false;
					}
					else if (this.build.isTag('DIV'))
					{
						this.opts.type = 'div';

						// empty
						if (this.$editor.html() === '')
						{
							this.$editor.html(this.opts.emptyHtml);
						}

					}
					else if (this.build.isTag('PRE'))
					{
						this.opts.type = 'pre';
					}
					else
					{
						this.build.startTextarea();
					}

					// set in
					this.build.setIn();

					// set id
					this.build.setId();

					// enable
					this.build.enableEditor();

					// options
					this.build.setOptions();

					// call
					this.build.callEditor();

				},
				createContainerBox: function()
				{
					this.$box = $('<div class="redactor-box" role="application" />');
				},
				setIn: function()
				{
					this.core.editor().addClass('redactor-in');
				},
				setId: function()
				{
					var id = (this.opts.type === 'textarea') ? 'redactor-uuid-' + this.uuid : this.$element.attr('id');

					this.core.editor().attr('id', (typeof id === 'undefined') ? 'redactor-uuid-' + this.uuid : id);
				},
				getName: function()
				{
					var name = this.$element.attr('name');

					return (typeof name === 'undefined') ? 'content-' + this.uuid : name;
				},
				loadFromTextarea: function()
				{
					this.$editor = $('<div />');

					// textarea
					this.$textarea = this.$element;
					this.$element.attr('name', this.build.getName());

					// place
					this.$box.insertAfter(this.$element).append(this.$editor).append(this.$element);
					this.$editor.addClass('redactor-editor');
					this.$element.hide();

					this.$box.prepend('<span class="redactor-voice-label" id="redactor-voice-' + this.uuid +'" aria-hidden="false">' + this.lang.get('accessibility-help-label') + '</span>');
					this.$editor.attr({ 'aria-labelledby': 'redactor-voice-' + this.uuid, 'role': 'presentation' });
				},
				startTextarea: function()
				{
					this.build.createContainerBox();

					// load
					this.build.loadFromTextarea();

					// set code
					this.code.start(this.core.textarea().val());

					// set value
					this.core.textarea().val(this.clean.onSync(this.$editor.html()));
				},
				isTag: function(tag)
				{
					return (this.$element[0].tagName === tag);
				},
				isInline: function()
				{
					return (!this.build.isTag('TEXTAREA') && !this.build.isTag('DIV') && !this.build.isTag('PRE'));
				},
				enableEditor: function()
				{
					this.core.editor().attr({ 'contenteditable': true });
				},
				setOptions: function()
				{
					// inline
					if (this.opts.type === 'inline')
					{
						this.opts.enterKey = false;
					}

					// inline & pre
					if (this.opts.type === 'inline' || this.opts.type === 'pre')
					{
						this.opts.toolbarMobile = false;
						this.opts.toolbar = false;
						this.opts.air = false;
						this.opts.linkify = false;

					}

					// structure
					if (this.opts.structure)
					{
						this.core.editor().addClass('redactor-structure');
					}

					// options sets only in textarea mode
					if (this.opts.type !== 'textarea')
					{
						return;
					}

					// direction
					this.core.box().attr('dir', this.opts.direction);
					this.core.editor().attr('dir', this.opts.direction);

					// tabindex
					if (this.opts.tabindex)
					{
						this.core.editor().attr('tabindex', this.opts.tabindex);
					}

					// min height
					if (this.opts.minHeight)
					{
						this.core.editor().css('min-height', this.opts.minHeight);
					}

					// max height
					if (this.opts.maxHeight)
					{
						this.core.editor().css('max-height', this.opts.maxHeight);
					}

					// max width
					if (this.opts.maxWidth)
					{
						this.core.editor().css({ 'max-width': this.opts.maxWidth, 'margin': 'auto' });
					}


				},
				callEditor: function()
				{
					this.build.disableBrowsersEditing();

					this.events.init();
					this.build.setHelpers();

					// init buttons
					if (this.opts.toolbar || this.opts.air)
					{
						this.toolbarsButtons = this.button.init();
					}

					// custom toolbar
					if (this.opts.toolbarCustom)
					{
						this.toolbar.custom();
					}

					// load toolbar
					if (this.opts.air)
					{
						this.air.build();
					}
					else if (this.opts.toolbar)
					{
						this.toolbar.build();
					}

					if (this.utils.isMobile() && this.opts.toolbarMobile && this.opts.air)
					{
						this.opts.toolbar = true;
						this.toolbar.build();
					}

					// observe dropdowns
					if (this.opts.air || this.opts.toolbar)
					{
						this.core.editor().on('mouseup.redactor keyup.redactor focus.redactor', $.proxy(this.observe.dropdowns, this));
					}

					// modal templates init
					this.modal.templates();

					// plugins
					this.build.plugins();

					// autosave
					this.autosave.init();

					// sync code
					this.code.html = this.code.cleaned(this.core.editor().html());

					// observers
					setTimeout($.proxy(this.observe.load, this), 4);

					// init callback
					this.core.callback('init');
					this.core.callback('initToEdit');

					// started
					this.start = false;

				},
				setHelpers: function()
				{
					// linkify
					if (this.opts.linkify)
					{
						this.linkify.format();
					}

					// placeholder
					this.placeholder.enable();

					// focus
					if (this.opts.focus)
					{
						setTimeout(this.focus.start, 100);
					}
					else if (this.opts.focusEnd)
					{
						setTimeout(this.focus.end, 100);
					}

				},
				disableBrowsersEditing: function()
				{
					try {
						// FF fix
						document.execCommand('enableObjectResizing', false, false);
						document.execCommand('enableInlineTableEditing', false, false);
						// IE prevent converting links
						document.execCommand("AutoUrlDetect", false, false);
					} catch (e) {}
				},
				plugins: function()
				{
					if (!this.opts.plugins)
					{
						return;
					}

					$.each(this.opts.plugins, $.proxy(function(i, s)
					{
						var func = (typeof RedactorPlugins !== 'undefined' && typeof RedactorPlugins[s] !== 'undefined') ? RedactorPlugins : Redactor.fn;

						if (!$.isFunction(func[s]))
						{
							return;
						}

						this[s] = func[s]();

						// get methods
						var methods = this.getModuleMethods(this[s]);
						var len = methods.length;

						// bind methods
						for (var z = 0; z < len; z++)
						{
							this[s][methods[z]] = this[s][methods[z]].bind(this);
						}

						// append lang
						if (typeof this[s].langs !== 'undefined')
						{
							var lang = {};
							if (typeof this[s].langs[this.opts.lang] !== 'undefined')
							{
								lang = this[s].langs[this.opts.lang];
							}
							else if (typeof this[s].langs[this.opts.lang] === 'undefined' && typeof this[s].langs.en !== 'undefined')
							{
								lang = this[s].langs.en;
							}

							// extend
							var self = this;
							$.each(lang, function(i,s)
							{
								if (typeof self.opts.curLang[i] === 'undefined')
								{
									self.opts.curLang[i] = s;
								}
							});
						}

						// init
						if ($.isFunction(this[s].init))
						{
							this[s].init();
						}


					}, this));

				}
			};
		},

		// =button
		button: function()
		{
			return {
				toolbar: function()
				{
					return (typeof this.button.$toolbar === 'undefined' || !this.button.$toolbar) ? this.$toolbar : this.button.$toolbar;
				},
				init: function()
				{
					return {
						format:
						{
							title: this.lang.get('format'),
							dropdown:
							{
								p:
								{
									title: this.lang.get('paragraph'),
									func: 'block.format'
								},
								blockquote:
								{
									title: this.lang.get('quote'),
									func: 'block.format'
								},
								pre:
								{
									title: this.lang.get('code'),
									func: 'block.format'
								},
								h1:
								{
									title: this.lang.get('heading1'),
									func: 'block.format'
								},
								h2:
								{
									title: this.lang.get('heading2'),
									func: 'block.format'
								},
								h3:
								{
									title: this.lang.get('heading3'),
									func: 'block.format'
								},
								h4:
								{
									title: this.lang.get('heading4'),
									func: 'block.format'
								},
								h5:
								{
									title: this.lang.get('heading5'),
									func: 'block.format'
								},
								h6:
								{
									title: this.lang.get('heading6'),
									func: 'block.format'
								}
							}
						},
						bold:
						{
							title: this.lang.get('bold-abbr'),
							label: this.lang.get('bold'),
							func: 'inline.format'
						},
						italic:
						{
							title: this.lang.get('italic-abbr'),
							label: this.lang.get('italic'),
							func: 'inline.format'
						},
						deleted:
						{
							title: this.lang.get('deleted-abbr'),
							label: this.lang.get('deleted'),
							func: 'inline.format'
						},
						underline:
						{
							title: this.lang.get('underline-abbr'),
							label: this.lang.get('underline'),
							func: 'inline.format'
						},
						lists:
						{
							title: this.lang.get('lists'),
							dropdown:
							{
								unorderedlist:
								{
									title: '&bull; ' + this.lang.get('unorderedlist'),
									func: 'list.toggle'
								},
								orderedlist:
								{
									title: '1. ' + this.lang.get('orderedlist'),
									func: 'list.toggle'
								},
								outdent:
								{
									title: '< ' + this.lang.get('outdent'),
									func: 'indent.decrease',
									observe: {
										element: 'li',
										out: {
											attr: {
												'class': 'redactor-dropdown-link-inactive',
												'aria-disabled': true
											}
										}
									}
								},
								indent:
								{
									title: '> ' + this.lang.get('indent'),
									func: 'indent.increase',
									observe: {
										element: 'li',
										out: {
											attr: {
												'class': 'redactor-dropdown-link-inactive',
												'aria-disabled': true
											}
										}
									}
								}
							}
						},
						image:
						{
							title: this.lang.get('image'),
							func: 'image.show'
						},
						file:
						{
							title: this.lang.get('file'),
							func: 'file.show'
						},
						link:
						{
							title: this.lang.get('link'),
							dropdown:
							{
								link:
								{
									title: this.lang.get('link-insert'),
									func: 'link.show',
									observe: {
										element: 'a',
										in: {
											title: this.lang.get('link-edit'),
										},
										out: {
											title: this.lang.get('link-insert')
										}
									}
								},
								unlink:
								{
									title: this.lang.get('unlink'),
									func: 'link.unlink',
									observe: {
										element: 'a',
										out: {
											attr: {
												'class': 'redactor-dropdown-link-inactive',
												'aria-disabled': true
											}
										}
									}
								}
							}
						},
						horizontalrule:
						{
							title: this.lang.get('horizontalrule'),
							func: 'line.insert'
						}
					};
				},
				setFormatting: function()
				{
					$.each(this.toolbarsButtons.format.dropdown, $.proxy(function (i, s)
					{
						if ($.inArray(i, this.opts.formatting) === -1)
						{
							delete this.toolbarsButtons.format.dropdown[i];
						}

					}, this));

				},
				hideButtons: function()
				{
					if (this.opts.buttonsHide.length !== 0)
					{
						this.button.hideButtonsSlicer(this.opts.buttonsHide);
					}
				},
				hideButtonsOnMobile: function()
				{
					if (this.utils.isMobile() && this.opts.buttonsHideOnMobile.length !== 0)
					{
						this.button.hideButtonsSlicer(this.opts.buttonsHideOnMobile);
					}
				},
				hideButtonsSlicer: function(buttons)
				{
					$.each(buttons, $.proxy(function(i, s)
					{
						var index = this.opts.buttons.indexOf(s);
						this.opts.buttons.splice(index, 1);

					}, this));
				},
				load: function($toolbar)
				{
					this.button.buttons = [];

					$.each(this.opts.buttons, $.proxy(function(i, btnName)
					{
						if (!this.toolbarsButtons[btnName])
						{
							return;
						}

						if (btnName === 'file' && (!this.opts.fileUpload || !this.opts.fileUpload && !this.opts.s3))
						{
							return;
						}

						if (btnName === 'image' && (!this.opts.imageUpload || !this.opts.imageUpload && !this.opts.s3))
						{
							return;
						}

						$toolbar.append($('<li>').append(this.button.build(btnName, this.toolbarsButtons[btnName])));

					}, this));
				},
				build: function(btnName, btnObject)
				{
					var $button = $('<a href="javascript:void(null);" class="re-button re-' + btnName + '" rel="' + btnName + '" />').html(btnObject.title);
					$button.attr({ 'role': 'button', 'aria-label': btnObject.title, 'tabindex': '-1' });

					if (typeof btnObject.label !== 'undefined')
					{
						$button.attr('aria-label', btnObject.label);
					}

					// click
					if (btnObject.func || btnObject.command || btnObject.dropdown)
					{
						this.button.setEvent($button, btnName, btnObject);
					}

					// dropdown
					if (btnObject.dropdown)
					{
						$button.addClass('redactor-toolbar-link-dropdown').attr('aria-haspopup', true);

						var $dropdown = $('<div class="redactor-dropdown redactor-dropdown-' + this.uuid + ' redactor-dropdown-box-' + btnName + '" style="display: none;">');
						$button.data('dropdown', $dropdown);
						this.dropdown.build(btnName, $dropdown, btnObject.dropdown);
					}

					this.button.buttons.push($button);

					return $button;
				},
				setEvent: function($button, btnName, btnObject)
				{
					$button.on('click', $.proxy(function(e)
					{
						if ($button.hasClass('redactor-button-disabled'))
						{
							return false;
						}

						var type = 'func';
						var callback = btnObject.func;

						if (btnObject.command)
						{
							type = 'command';
							callback = btnObject.command;
						}
						else if (btnObject.dropdown)
						{
							type = 'dropdown';
							callback = false;
						}

						this.button.toggle(e, btnName, type, callback);

						return false;

					}, this));
				},
				toggle: function(e, btnName, type, callback, args)
				{
					e.preventDefault();

					if (this.browser.ie())
					{
						this.utils.freezeScroll();
						e.returnValue = false;
					}

					if (type === 'command')
					{
						this.inline.format(callback);
					}
					else if (type === 'dropdown')
					{
						this.dropdown.show(e, btnName);
					}
					else
					{
						this.button.clickCallback(e, callback, btnName, args);
					}

					if (this.opts.air && type !== 'dropdown')
					{
						this.air.hide(e);
					}

					if (this.browser.ie())
					{
						this.utils.unfreezeScroll();
					}
				},
				clickCallback: function(e, callback, btnName, args)
				{
					var func;

					args = (typeof args === 'undefined') ? btnName : args;

					if ($.isFunction(callback))
					{
						callback.call(this, btnName);
					}
					else if (callback.search(/\./) !== '-1')
					{
						func = callback.split('.');
						if (typeof this[func[0]] === 'undefined')
						{
							return;
						}

						if (typeof args === 'object')
						{
							this[func[0]][func[1]].apply(this, args);
						}
						else
						{
							this[func[0]][func[1]].call(this, args);
						}
					}
					else
					{
						if (typeof args === 'object')
						{
							this[callback].apply(this, args);
						}
						else
						{
							this[callback].call(this, args);
						}
					}

				},
				all: function()
				{
					return this.button.buttons;
				},
				get: function(key)
				{
					return this.button.toolbar().find('a.re-' + key);
				},
				set: function(key, title)
				{
					var $btn = this.button.toolbar().find('a.re-' + key);

					$btn.html(title).attr('aria-label', title);

					return $btn;
				},
				add: function(key, title)
				{
					if (this.button.isMobileUndoRedo(key))
					{
						return;
					}

					var btn = this.button.build(key, { title: title });

					this.button.toolbar().append($('<li>').append(btn));

					return btn;
				},
				addFirst: function(key, title)
				{
					if (this.button.isMobileUndoRedo(key))
					{
						return;
					}

					var btn = this.button.build(key, { title: title });

					this.button.toolbar().prepend($('<li>').append(btn));

					return btn;
				},
				addAfter: function(afterkey, key, title)
				{
					if (this.button.isMobileUndoRedo(key))
					{
						return;
					}

					var btn = this.button.build(key, { title: title });
					var $btn = this.button.get(afterkey);

					if ($btn.length !== 0)
					{
						$btn.parent().after($('<li>').append(btn));
					}
					else
					{
						this.button.toolbar().append($('<li>').append(btn));
					}

					return btn;
				},
				addBefore: function(beforekey, key, title)
				{
					if (this.button.isMobileUndoRedo(key))
					{
						return;
					}

					var btn = this.button.build(key, { title: title });
					var $btn = this.button.get(beforekey);

					if ($btn.length !== 0)
					{
						$btn.parent().before($('<li>').append(btn));
					}
					else
					{
						this.button.toolbar().append($('<li>').append(btn));
					}

					return btn;
				},
				setIcon: function($btn, icon)
				{
					$btn.html(icon);
				},
				addCallback: function($btn, callback)
				{
					if (typeof $btn === 'undefined')
					{
						return;
					}

					var type = (callback === 'dropdown') ? 'dropdown' : 'func';
					var key = $btn.attr('rel');
					$btn.on('touchstart click', $.proxy(function(e)
					{
						if ($btn.hasClass('redactor-button-disabled'))
						{
							return false;
						}

						this.button.toggle(e, key, type, callback);

					}, this));
				},
				addDropdown: function($btn, dropdown)
				{
					$btn.addClass('redactor-toolbar-link-dropdown').attr('aria-haspopup', true);

					var key = $btn.attr('rel');
					this.button.addCallback($btn, 'dropdown');

					var $dropdown = $('<div class="redactor-dropdown redactor-dropdown-' + this.uuid + ' redactor-dropdown-box-' + key + '" style="display: none;">');
					$btn.data('dropdown', $dropdown);

					// build dropdown
					if (dropdown)
					{
						this.dropdown.build(key, $dropdown, dropdown);
					}

					return $dropdown;
				},
				setActive: function(key)
				{
					this.button.get(key).addClass('redactor-act');
				},
				setInactive: function(key)
				{
					this.button.get(key).removeClass('redactor-act');
				},
				setInactiveAll: function(key)
				{
					var $btns = this.button.toolbar().find('a.re-button');
					if (typeof key !== 'undefined')
					{
						$btns = $btns.not('.re-' + key);
					}

					$btns.removeClass('redactor-act');
				},
				disableAll: function(key)
				{
					var $btns = this.button.toolbar().find('a.re-button');
					if (typeof key !== 'undefined')
					{
						$btns = $btns.not('.re-' + key);
					}

					$btns.addClass('redactor-button-disabled');
				},
				enableAll: function()
				{
					this.button.toolbar().find('a.re-button').removeClass('redactor-button-disabled');
				},
				remove: function(key)
				{
					this.button.get(key).remove();
				},
				isMobileUndoRedo: function(key)
				{
					return (key === "undo" || key === "redo") && !this.utils.isDesktop();
				}
			};
		},

		// =caret
		caret: function()
		{
			return {
				set: function(node1, node2, end)
				{
					this.core.editor().focus();

					end = (typeof end === 'undefined') ? 0 : 1;

					node1 = node1[0] || node1;
					node2 = node2[0] || node2;

					var sel = this.selection.get();
					var range = this.selection.range(sel);

					try
					{
						range.setStart(node1, 0);
						range.setEnd(node2, end);
					}
					catch (e) {}

					this.selection.update(sel, range);
				},
				prepare: function(node)
				{
					// firefox focus
					if (typeof this.start !== 'undefined')
					{
						this.core.editor().focus();
					}

					return node[0] || node;
				},
				start: function(node)
				{

					var sel, range;
					node = this.caret.prepare(node);

					if (!node)
					{
						return;
					}

					if (node.tagName === 'BR')
					{
						return this.caret.before(node);
					}

					// empty or inline tag
					var inline = this.utils.isInlineTag(node.tagName);
					if (node.innerHTML === '' || inline)
					{
					    range = document.createRange();
						var textNode = document.createTextNode('\u200B');

						range.setStart(node, 0);
						range.insertNode(textNode);
						range.setStartAfter(textNode);
						range.collapse(true);
						sel = window.getSelection();
						sel.removeAllRanges();
						sel.addRange(range);

						// remove invisible text node
						if (!inline)
						{
							this.core.editor().on('keydown.redactor-remove-textnode', function()
							{
								$(textNode).remove();
								$(this).off('keydown.redactor-remove-textnode');
							});
						}
					}
					// block tag
					else
					{
						sel = window.getSelection();
						sel.removeAllRanges();

						range = document.createRange();
						range.selectNodeContents(node);
						range.collapse(true);
						sel.addRange(range);

					}


				},
				end: function(node)
				{
					var sel, range;
					node = this.caret.prepare(node);

					if (!node)
					{
						return;
					}

					// empty node
					if (node.tagName !== 'BR' && node.innerHTML === '')
					{
						return this.caret.start(node);
					}

					// br
					if (node.tagName === 'BR')
					{
						var space = document.createElement('span');
						space.className = 'redactor-invisible-space';
						space.innerHTML = '&#x200b;';

						$(node).after(space);

						sel = window.getSelection();
						sel.removeAllRanges();

						range = document.createRange();

						range.setStartBefore(space);
						range.setEndBefore(space);
						sel.addRange(range);

						$(space).replaceWith(function()
						{
							return $(this).contents();
						});

						return;
					}

					if (node.lastChild && node.lastChild.nodeType === 1)
					{
						return this.caret.after(node.lastChild);
					}

					sel = window.getSelection();
					sel.removeAllRanges();

					range = document.createRange();
					range.selectNodeContents(node);
					range.collapse(false);
					sel.addRange(range);
				},
				after: function(node)
				{
					var sel, range;
					node = this.caret.prepare(node);


					if (!node)
					{
						return;
					}

					if (node.tagName === 'BR')
					{
						return this.caret.end(node);
					}

					// block tag
					if (this.utils.isBlockTag(node.tagName))
					{
						var next = this.caret.next(node);

						if (typeof next === 'undefined')
						{
							this.caret.end(node);
						}
						else
						{
							// table
							if (next.tagName === 'TABLE')
							{
								next = $(next).find('th, td').first()[0];
							}
							// list
							else if (next.tagName === 'UL' || next.tagName === 'OL')
							{
								next = $(next).find('li').first()[0];
							}

							this.caret.start(next);
						}

						return;
					}

					// inline tag
					var textNode = document.createTextNode('\u200B');

					sel = window.getSelection();
					sel.removeAllRanges();

					range = document.createRange();
					range.setStartAfter(node);
					range.insertNode(textNode);
					range.setStartAfter(textNode);
					range.collapse(true);

					sel.addRange(range);

				},
				before: function(node)
				{
					var sel, range;
					node = this.caret.prepare(node);


					if (!node)
					{
						return;
					}

					// block tag
					if (this.utils.isBlockTag(node.tagName))
					{
						var prev = this.caret.prev(node);

						if (typeof prev === 'undefined')
						{
							this.caret.start(node);
						}
						else
						{
							// table
							if (prev.tagName === 'TABLE')
							{
								prev = $(prev).find('th, td').last()[0];
							}
							// list
							else if (prev.tagName === 'UL' || prev.tagName === 'OL')
							{
								prev = $(prev).find('li').last()[0];
							}

							this.caret.end(prev);
						}

						return;
					}

					// inline tag
					sel = window.getSelection();
					sel.removeAllRanges();

					range = document.createRange();

			        range.setStartBefore(node);
			        range.collapse(true);

			        sel.addRange(range);
				},
				next: function(node)
				{
					var $next = $(node).next();
					if ($next.hasClass('redactor-script-tag, redactor-selection-marker'))
					{
						return $next.next()[0];
					}
					else
					{
						return $next[0];
					}
				},
				prev: function(node)
				{
					var $prev = $(node).prev();
					if ($prev.hasClass('redactor-script-tag, redactor-selection-marker'))
					{
						return $prev.prev()[0];
					}
					else
					{
						return $prev[0];
					}
				},
				offset: function(node)
				{
					var sel, range, cloned;

					if (typeof node === 'undefined')
					{
					    sel = this.selection.get();
						range = this.selection.range(sel);

				        cloned = range.cloneRange();
				        cloned.selectNodeContents(this.$editor[0]);
				        cloned.setEnd(range.endContainer, range.endOffset);

						return $.trim(cloned.toString().replace(/\u200B/g, '')).length;
					}
					else
					{
						node = node[0] || node;

						sel = this.selection.get();
						range = this.selection.range(sel);

						cloned = range.cloneRange();
						cloned.selectNodeContents(node);
						cloned.setEnd(range.endContainer, range.endOffset);


						return $.trim(cloned.toString().replace(/\u200B/g, '')).length;
					}
				}

			};
		},

		// =clean
		clean: function()
		{
			return {
				onSet: function(html)
				{
					html = this.clean.savePreCode(html);
					html = this.clean.saveFormTags(html);

					// convert script tag
					if (this.opts.script)
					{
						html = html.replace(/<script(.*?[^>]?)>([\w\W]*?)<\/script>/gi, '<pre class="redactor-script-tag" $1>$2</pre>');
					}

					// converting entity
					html = html.replace(/\$/g, '&#36;');
					html = html.replace(/&amp;/g, '&');

					// replace special characters in links
					html = html.replace(/<a href="(.*?[^>]?)®(.*?[^>]?)">/gi, '<a href="$1&reg$2">');

					// replace tags
					var self = this;
					var $div = $("<div/>").html($.parseHTML(html, document, true));
					var replacement = {
						'b': 'strong',
						'i': 'em',
						'strike': 'del'
					};

					$div.find('b, i, strike').replaceWith(function()
					{
						return self.utils.replaceToTag(this, replacement[this.tagName.toLowerCase()]);
					});

					html = $div.html();

					// remove tags
					var tags = ['font', 'html', 'head', 'link', 'body', 'meta', 'applet', 'span'];
					if (!this.opts.script)
					{
						tags.push('script');
					}

					html = this.clean.stripTags(html, tags);

					// remove html comments
					html = html.replace(/<!--[\s\S]*?-->/gi, '');

					// paragraphize
					html = this.paragraphize.load(html);

					// empty
					if (html.search(/^(||\s||<br\s?\/?>||&nbsp;)$/i) !== -1)
					{
						return this.opts.emptyHtml;
					}

					return html;
				},
				onGet: function(html)
				{
					return this.clean.onSync(html);
				},
				onSync: function(html)
				{
					// remove spaces
					html = html.replace(/\u200B/g, '');
					html = html.replace(/&#x200b;/gi, '');
					html = html.replace(/&nbsp;/gi, ' ');

					if (html.search(/^<p>(||\s||<br\s?\/?>||&nbsp;)<\/p>$/i) !== -1)
					{
						return '';
					}

					var $div = $("<div/>").html($.parseHTML(html, document, true));

					// remove empty atributes
					$div.find('*[style=""]').removeAttr('style');
					$div.find('*[class=""]').removeAttr('class');
					$div.find('*[rel=""]').removeAttr('rel');

					// remove markers
					$div.find('.redactor-invisible-space').each(function()
					{
						$(this).contents().unwrap();
					});

					// remove span
					$div.find('span').each(function()
					{
						$(this).contents().unwrap();
					});

					$div.find('.redactor-selection-marker, #redactor-insert-marker').remove();

					html = $div.html();

					// reconvert script tag
					if (this.opts.script)
					{
						html = html.replace(/<pre class="redactor-script-tag"(.*?[^>]?)>([\w\W]*?)<\/pre>/gi, '<script$1>$2</script>');
					}

					// restore form tag
					html = this.clean.restoreFormTags(html);

					// remove br in|of li/header tags
					html = html.replace(new RegExp('<br\\s?/?></h', 'gi'), '</h');
					html = html.replace(new RegExp('<br\\s?/?></li>', 'gi'), '</li>');
					html = html.replace(new RegExp('</li><br\\s?/?>', 'gi'), '</li>');

					// pre class
					if (this.opts.preClass)
					{
						html = html.replace(/<pre>/gi, '<pre class="' + this.opts.preClass + '">');
					}

					// link nofollow
					if (this.opts.linkNofollow)
					{
						html = html.replace(/<a(.*?)rel="nofollow"(.*?[^>])>/gi, '<a$1$2>');
						html = html.replace(/<a(.*?[^>])>/gi, '<a$1 rel="nofollow">');
					}

					// replace special characters
					var chars = {
						'\u2122': '&trade;',
						'\u00a9': '&copy;',
						'\u2026': '&hellip;',
						'\u2014': '&mdash;',
						'\u2010': '&dash;'
					};

					$.each(chars, function(i,s)
					{
						html = html.replace(new RegExp(i, 'g'), s);
					});

					html = html.replace(/&amp;/g, '&');

					return html;
				},
				onPaste: function(html, insert)
				{
					var blocks = this.selection.blocks();

					this.paste.text = false;
					this.insert.gap = false;

					html = $.trim(html);

					if (insert !== true)
					{
						html = html.replace(/</g, '&lt;');
						html = html.replace(/>/g, '&gt;');
					}

					if (this.opts.enterKey === false || this.opts.type === 'inline' || (blocks.length === 1 && this.utils.isCurrentOrParent(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'a', 'figcaption'])))
					{
						this.paste.text = true;

						if (typeof insert !== 'undefined')
						{
							html = this.clean.getPlainText(html);
						}

						return html;
					}
					else if (blocks.length === 1 && this.utils.isCurrentOrParent(['th', 'td', 'blockquote']))
					{
						if (typeof insert !== 'undefined')
						{
							html = html.replace(/<br\s?\/?>|<\/H[1-6]>|<\/p>|<\/div>|<\/li>|<\/td>/gi, '\n');
							html = this.clean.getPlainText(html);
						}

						html = html.replace(/\n/g, '<br />');

						return html;
					}
					else if (this.opts.type === 'pre' || (blocks.length === 1 && this.utils.isCurrentOrParent('pre')))
					{

						html = html.replace(/”/g, '"');
						html = html.replace(/“/g, '"');
						html = html.replace(/‘/g, '\'');
						html = html.replace(/’/g, '\'');
						html = this.clean.encodeEntities(html);

						return html;
					}

					this.paste.text = false;
					this.insert.gap = true;

					// if no block level tags
					if (typeof insert !== 'undefined')
					{
						var match1 = html.match(new RegExp('</(' + this.opts.blockTags.join('|' ).toUpperCase() + ')>', 'gi'));
						var match2 = html.match(new RegExp('<hr\s?/?>', 'gi'));
						if (match1 === null && match2 === null)
						{
							this.insert.gap = false;

							return html;
						}
					}

					// if text as single line
					var singleLine = false;
					if (!this.utils.isSelectAll())
					{
						var matchBR = html.match(/<br\s?\/?>/gi);
						var matchNL = html.match(/\n/gi);
						if (!matchBR && !matchNL)
						{
							singleLine = true;
						}
					}

					if (singleLine)
					{
						this.paste.text = true;
					}
					else
					{
						html = this.paragraphize.load(html);
					}

					return html;
				},
				getPlainText: function(html)
				{
					var tmp = document.createElement('div');
					tmp.innerHTML = html;
					html = tmp.textContent || tmp.innerText;

					return $.trim(html);
				},
				savePreCode: function(html)
				{
					html = this.clean.savePreFormatting(html);
					html = this.clean.saveCodeFormatting(html);

					return html;
				},
				savePreFormatting: function(html)
				{
					var pre = html.match(/<pre(.*?)>([\w\W]*?)<\/pre>/gi);
					if (pre === null)
					{
						return html;
					}

					$.each(pre, $.proxy(function(i,s)
					{
						var arr = s.match(/<pre(.*?)>([\w\W]*?)<\/pre>/i);

						arr[2] = arr[2].replace(/<br\s?\/?>/g, '\n');
						arr[2] = arr[2].replace(/&nbsp;/g, ' ');

						if (this.opts.preSpaces)
						{
							arr[2] = arr[2].replace(/\t/g, new Array(this.opts.preSpaces + 1).join(' '));
						}

						arr[2] = this.clean.encodeEntities(arr[2]);

						// $ fix
						arr[2] = arr[2].replace(/\$/g, '&#36;');

						html = html.replace(s, '<pre' + arr[1] + '>' + arr[2] + '</pre>');

					}, this));

					return html;
				},
				saveCodeFormatting: function(html)
				{
					var code = html.match(/<code(.*?)>([\w\W]*?)<\/code>/gi);
					if (code === null)
					{
						return html;
					}

					$.each(code, $.proxy(function(i,s)
					{
						var arr = s.match(/<code(.*?)>([\w\W]*?)<\/code>/i);

						arr[2] = arr[2].replace(/&nbsp;/g, ' ');
						arr[2] = this.clean.encodeEntities(arr[2]);
						arr[2] = arr[2].replace(/\$/g, '&#36;');

						html = html.replace(s, '<code' + arr[1] + '>' + arr[2] + '</code>');

					}, this));

					return html;
				},
				saveFormTags: function(html)
				{
					return html.replace(/<form(.*?)>([\w\W]*?)<\/form>/gi, '<section$1 rel="redactor-form-tag">$2</section>');
				},
				restoreFormTags: function(html)
				{
					return html.replace(/<section(.*?) rel="redactor-form-tag"(.*?)>([\w\W]*?)<\/section>/gi, '<form$1$2>$3</form>');
				},
				encodeEntities: function(str)
				{
					str = String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
					str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

					return str;
				},
				stripTags: function(input, denied)
				{
					if (typeof denied === 'undefined')
					{
						return input.replace(/(<([^>]+)>)/gi, '');
					}

				    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

				    return input.replace(tags, function ($0, $1)
				    {
				        return denied.indexOf($1.toLowerCase()) === -1 ? $0 : '';
				    });
				},
				removeMarkers: function(html)
				{
					return html.replace(/<span(.*?[^>]?)class="redactor-selection-marker"(.*?[^>]?)>([\w\W]*?)<\/span>/gi, '');
				},
				removeSpaces: function(html)
				{
					html = $.trim(html);
					html = html.replace(/\n/g, '');
					html = html.replace(/[\t]*/g, '');
					html = html.replace(/\n\s*\n/g, "\n");
					html = html.replace(/^[\s\n]*/g, ' ');
					html = html.replace(/[\s\n]*$/g, ' ');
					html = html.replace( />\s{2,}</g, '> <'); // between inline tags can be only one space
					html = html.replace(/\n\n/g, "\n");
					html = html.replace(/\u200B/g, '');

					return html;
				},
				removeSpacesHard: function(html)
				{
					html = $.trim(html);
					html = html.replace(/\n/g, '');
					html = html.replace(/[\t]*/g, '');
					html = html.replace(/\n\s*\n/g, "\n");
					html = html.replace(/^[\s\n]*/g, '');
					html = html.replace(/[\s\n]*$/g, '');
					html = html.replace( />\s{2,}</g, '><');
					html = html.replace(/\n\n/g, "\n");
					html = html.replace(/\u200B/g, '');

					return html;
				}
			};
		},

		// =code
		code: function()
		{
			return {
				syncFire: true,
				html: false,
				start: function(html)
				{
					html = $.trim(html);

					// clean
					if (this.opts.type === 'textarea')
					{
						html = this.clean.onSet(html);
					}

					this.events.stopDetect();
					this.core.editor().html(html);
					this.events.startDetect();
				},
				set: function(html)
				{
					html = $.trim(html);

					// clean
					if (this.opts.type === 'textarea')
					{
						html = this.clean.onSet(html);
					}

					this.core.editor().html(html);
					this.focus.end();
				},
				get: function()
				{
					if (this.opts.type === 'textarea')
					{
						return this.core.textarea().val();
					}
					else
					{
						var html = this.core.editor().html();

						// clean
						html = this.clean.onGet(html);

						return html;
					}
				},
				sync: function()
				{
					if (!this.code.syncFire)
					{
						return;
					}

					var html = this.core.editor().html();
					var htmlCleaned = this.code.cleaned(html);

					// is there a need to synchronize
					if (this.code.isSync(htmlCleaned))
					{
						// do not sync
						return;
					}

					// save code
					this.code.html = htmlCleaned;

					if (this.opts.type !== 'textarea')
					{
						this.core.callback('sync', html);
						this.core.callback('change', html);
						return;
					}

					if (this.opts.type === 'textarea')
					{
						setTimeout($.proxy(function()
						{
							this.code.startSync(html);
						}, this), 10);
					}
				},
				startSync: function(html)
				{
					// before clean callback
					html = this.core.callback('syncBefore', html);

					// clean
					html = this.clean.onSync(html);

					// set code
					this.core.textarea().val(html);

					// after sync callback
					this.core.callback('sync', html);

					// change callback
					if (this.start === false)
					{
						this.core.callback('change', html);
					}

					this.start = false;
				},
				isSync: function(htmlCleaned)
				{
					return (this.code.html && this.code.html === htmlCleaned);

				},
				cleaned: function(html)
				{
					html = this.clean.removeSpaces(html);
					return this.clean.removeMarkers(html);
				}
			};
		},

		// =core
		core: function()
		{
			return {
				id: function()
				{
					return this.$editor.attr('id');
				},
				element: function()
				{
					return this.$element;
				},
				editor: function()
				{
					return this.$editor;
				},
				textarea: function()
				{
					return this.$textarea;
				},
				box: function()
				{
					return (this.opts.type === 'textarea') ? this.$box : this.$element;
				},
				toolbar: function()
				{
					return (this.$toolbar) ? this.$toolbar : false;
				},
				air: function()
				{
					return (this.$air) ? this.$air : false;
				},
				object: function()
				{
					return $.extend({}, this);
				},
				structure: function()
				{
					this.core.editor().toggleClass('redactor-structure');
				},
				addEvent: function(name)
				{
					this.core.event = name;
				},
				getEvent: function()
				{
					return this.core.event;
				},
				callback: function(type, e, data)
				{
					var eventNamespace = 'redactor';
					var returnValue = false;
					var events = $._data(this.core.element()[0], 'events');

					// on callback
					if (typeof events !== 'undefined' && typeof events[type] !== 'undefined')
					{
						var len = events[type].length;
						for (var i = 0; i < len; i++)
						{
							var namespace = events[type][i].namespace;
							if (namespace === 'callback.' + eventNamespace)
							{
								var handler = events[type][i].handler;
								var args = (typeof data === 'undefined') ? [e] : [e, data];
								returnValue = (typeof args === 'undefined') ? handler.call(this, e) : handler.call(this, e, args);
							}
						}
					}

					if (returnValue)
					{
						return returnValue;
					}

					// no callback
					if (typeof this.opts.callbacks[type] === 'undefined')
					{
						return (typeof data === 'undefined') ? e : data;
					}

					// callback
					var callback = this.opts.callbacks[type];

					if ($.isFunction(callback))
					{
						return (typeof data === 'undefined') ? callback.call(this, e) : callback.call(this, e, data);
					}
					else
					{
						return (typeof data === 'undefined') ? e : data;
					}
				},
				destroy: function()
				{
					this.opts.destroyed = true;

					this.core.callback('destroy');

					// custom toolbar
					$('.redactor-data-cmd').off('click.redactor-data-cmd').removeClass('redactor-data-cmd');

					// placeholder style
					$('.redactor-style-tag').remove();

					// help label
					$('#redactor-voice-' + this.uuid).remove();

					this.core.editor().removeClass('redactor-in');

					// structure class
					this.core.editor().removeClass('redactor-structure');

					// caret service
					this.core.editor().off('keydown.redactor-remove-textnode');

					// observer
					this.observer.disconnect();

					// off events and remove data
					this.$element.off('.redactor').removeData('redactor');
					this.core.editor().off('.redactor');

					$(document).off('.redactor-air.' + this.uuid);
					$(document).off('mousedown.redactor-blur.' + this.uuid);
					$(document).off('mousedown.redactor.' + this.uuid);
					$(document).off('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid);
					$(window).off('.redactor-toolbar.' + this.uuid);
					$("body").off('scroll.redactor.' + this.uuid);

					$(this.opts.toolbarFixedTarget).off('scroll.redactor.' + this.uuid);

					// plugins events
					var self = this;
					$.each(this.opts.plugins, function(i,s)
					{
						$(window).off('.redactor-plugin-' + s);
						$(document).off('.redactor-plugin-' + s);
						$("body").off('.redactor-plugin-' + s);
						self.core.editor().off('.redactor-plugin-' + s);
					});

					// click to edit
					this.$element.off('click.redactor-click-to-edit');
					this.$element.removeClass('redactor-click-to-edit');

					// common
					this.core.editor().removeClass('redactor-editor redactor-linebreaks redactor-placeholder');
					this.core.editor().removeAttr('contenteditable');

					var html = this.code.get();

					if (this.opts.toolbar && this.$toolbar)
					{
						// dropdowns off
						this.$toolbar.find('a').each(function()
						{
							var $el = $(this);
							if ($el.data('dropdown'))
							{
								$el.data('dropdown').remove();
								$el.data('dropdown', {});
							}
						});
					}

					if (this.opts.type === 'textarea')
					{
						this.$box.after(this.$element);
						this.$box.remove();
						this.$element.val(html).show();
					}

					// air
					if (this.opts.air)
					{
						this.$air.remove();
					}

					if (this.opts.toolbar && this.$toolbar)
					{
						this.$toolbar.remove();
					}

					// modal
					if (this.$modalBox)
					{
						this.$modalBox.remove();
					}

					if (this.$modalOverlay)
					{
						this.$modalOverlay.remove();
					}

					// hide link's tooltip
					$('.redactor-link-tooltip').remove();

					// autosave
					clearInterval(this.autosaveTimeout);
				}
			};
		},

		// =dropdown
		dropdown: function()
		{
			return {
				build: function(name, $dropdown, dropdownObject)
				{
					if (name === 'format' && this.opts.formattingAdd)
					{
						$.each(this.opts.formattingAdd, $.proxy(function(i,s)
						{
							var func;
							var type = (this.utils.isBlockTag(s.args[0])) ? 'block' : 'inline';

							if (type === 'block')
							{
								func = 'block.format';
							}
							else
							{
								func = 'inline.format';
							}

							dropdownObject[i] = {
								func: func,
								args: s.args,
								title: s.title
							};

						}, this));
					}

					$.each(dropdownObject, $.proxy(function(btnName, btnObject)
					{
						var $item = $('<a href="#" class="redactor-dropdown-' + btnName + '" role="button">' + btnObject.title + '</a>');

						$item.on('click', $.proxy(function(e)
						{
							e.preventDefault();

							var type = 'func';
							var callback = btnObject.func;
							if (btnObject.command)
							{
								type = 'command';
								callback = btnObject.command;
							}
							else if (btnObject.dropdown)
							{
								type = 'dropdown';
								callback = btnObject.dropdown;
							}

							if ($(e.target).hasClass('redactor-dropdown-link-inactive'))
							{
								return;
							}

							if (typeof btnObject.args !== ' undefined')
							{
								this.button.toggle(e, btnName, type, callback, btnObject.args);
							}
							else
							{
								this.button.toggle(e, btnName, type, callback);
							}

							this.dropdown.hideAll();


						}, this));

						this.observe.addDropdown($item, btnName, btnObject);
						$dropdown.attr('rel', name).append($item);

					}, this));
				},
				show: function(e, key)
				{
					this.core.editor().focus();

					var $button = this.button.get(key);

					// Always re-append it to the end of <body> so it always has the highest sub-z-index.
					var $dropdown = $button.data('dropdown').appendTo(document.body);

					if ($button.hasClass('dropact'))
					{
						this.dropdown.hideAll();
					}
					else
					{
						this.dropdown.hideAll();

						this.core.callback('dropdownShow', { dropdown: $dropdown, key: key, button: $button });

						this.button.setActive(key);

						$button.addClass('dropact');

						var keyPosition = $button.offset();

						// fix right placement
						var dropdownWidth = $dropdown.width();
						if ((keyPosition.left + dropdownWidth) > $(document).width())
						{
							keyPosition.left = Math.max(0, keyPosition.left - dropdownWidth);
						}

						var top;
						var left = keyPosition.left + 'px';

						// fixed toolbar
						if (this.button.toolbar().hasClass('toolbar-fixed-box'))
						{
							top = $button.position().top + $button.innerHeight() + this.opts.toolbarFixedTopOffset;

							var position = 'fixed';
							if (this.opts.toolbarFixedTarget !== document)
							{
								top = ($button.innerHeight() + this.$toolbar.offset().top) + this.opts.toolbarFixedTopOffset;
								position = 'absolute';
							}

							$dropdown.css({ position: position, left: left, top: top + 'px' }).slideDown(300);
						}
						else
						{
							top = ($button.innerHeight() + keyPosition.top) + 'px';
							$dropdown.css({ position: 'absolute', left: left, top: top }).slideDown(300);
						}

						this.core.callback('dropdownShown', { dropdown: $dropdown, key: key, button: $button });

						this.$dropdown = $dropdown;
					}


					$(document).one('click.redactor-dropdown', $.proxy(this.dropdown.hide, this));
					this.$editor.one('click.redactor-dropdown', $.proxy(this.dropdown.hide, this));
					$(document).one('keyup.redactor-dropdown', $.proxy(this.dropdown.closeHandler, this));

					// disable scroll whan dropdown scroll
					$dropdown.on('mouseover.redactor-dropdown', $.proxy(this.utils.disableBodyScroll, this));
					$dropdown.on('mouseout.redactor-dropdown', $.proxy(this.utils.enableBodyScroll, this));


					e.stopPropagation();
				},
				closeHandler: function(e)
				{
					if (e.which !== this.keyCode.ESC)
					{
						return;
					}

					this.dropdown.hideAll();
					this.core.editor().focus();
				},
				hideAll: function()
				{
					this.button.toolbar().find('a.dropact').removeClass('redactor-act').removeClass('dropact');

					this.utils.enableBodyScroll();

					$('.redactor-dropdown-' + this.uuid).slideUp(200);
					$('.redactor-dropdown-link-selected').removeClass('redactor-dropdown-link-selected');


					if (this.$dropdown)
					{
						this.$dropdown.off('.redactor-dropdown');
						this.core.callback('dropdownHide', this.$dropdown);

						this.$dropdown = false;
					}
				},
				hide: function (e)
				{
					var $dropdown = $(e.target);

					if (!$dropdown.hasClass('dropact') && !$dropdown.hasClass('redactor-dropdown-link-inactive'))
					{
						$dropdown.removeClass('dropact');
						$dropdown.off('mouseover mouseout');

						this.dropdown.hideAll();
					}
				}
			};
		},

		// =events
		events: function()
		{
			return {
				focused: false,
				blured: true,
				stop: false,
				stopDetect: function()
				{
					this.events.stop = true;
				},
				startDetect: function()
				{
					var self = this;
					setTimeout(function()
					{
						self.events.stop = false;
					}, 1);
				},
				init: function()
				{
					// drop
					this.core.editor().on('dragover.redactor dragenter.redactor', function(e)
					{
						e.preventDefault();
						e.stopPropagation();
				    });

					this.core.editor().on('drop.redactor', $.proxy(function(e)
					{
						e = e.originalEvent || e;

						if (this.opts.type === 'inline' || this.opts.type === 'pre')
						{
							e.preventDefault();
							return false;
						}

						if (window.FormData === undefined || !e.dataTransfer)
						{
							return true;
						}

						if (e.dataTransfer.files.length === 0)
						{
							return this.events.drop(e);
						}
						else
						{
							this.events.dropUpload(e);
						}

						this.core.callback('drop', e);

					}, this));

					// click
					this.core.editor().on('click.redactor', $.proxy(function(e)
					{
						var event = this.core.getEvent();
						var type = (event === 'click' || event === 'arrow') ? false : 'click';

						this.core.addEvent(type);
						this.utils.disableSelectAll();
						this.core.callback('click', e);

					}, this));

					// paste
					this.core.editor().on('paste.redactor', $.proxy(this.paste.init, this));

					// keydown
					this.core.editor().on('keydown.redactor', $.proxy(this.keydown.init, this));

					// keyup
					this.core.editor().on('keyup.redactor', $.proxy(this.keyup.init, this));

					// change
					this.events.changeHandler = $.proxy(function()
					{
						if (this.events.stop)
						{
							return;
						}

						this.code.sync();

						// autosave
						if (this.autosave.is())
						{
							clearTimeout(this.autosaveTimeout);
							this.autosaveTimeout = setTimeout($.proxy(this.autosave.send, this), 300);
						}

					}, this);

					// observer
					var self = this;
					this.observer = new MutationObserver(function(mutations) {
					  mutations.forEach(function(mutation) {

						  	self.image.detectRemoved(self, mutation);
					  		self.events.changeHandler();

					  });
					});

					// pass in the target node, as well as the observer options
					this.observer.observe(this.core.editor()[0], {
						 subtree: true,
						 attributes: true,
						 childList: true,
						 characterData: true,
						 characterDataOldValue: true
					});

					// focus
					this.core.editor().on('focus.redactor', $.proxy(function(e)
					{
						if (this.rtePaste)
						{
							return;
						}

						if (this.events.isCallback('focus'))
						{
							this.core.callback('focus', e);
						}

						this.events.focused = true;
						this.events.blured = false;

						// tab
						if (this.selection.current() === false)
						{
							var sel = this.selection.get();
							var range = this.selection.range(sel);

							range.setStart(this.core.editor()[0], 0);
							range.setEnd(this.core.editor()[0], 0);
							this.selection.update(sel, range);
						}


					}, this));


					// blur
					$(document).on('mousedown.redactor-blur.' + this.uuid, $.proxy(function(e)
					{
						if (this.start || this.rtePaste)
						{
							return;
						}

						if ($(e.target).closest('#' + this.core.id() + ', .redactor-toolbar, .redactor-dropdown, #redactor-modal-box, .redactor-data-cmd').size() !== 0)
						{
							return;
						}

						this.utils.disableSelectAll();
						if (!this.events.blured && this.events.isCallback('blur'))
						{
							this.core.callback('blur', e);
						}

						this.events.focused = false;
						this.events.blured = true;

					}, this));
				},
				dropUpload: function(e)
				{
					e.preventDefault();
					e.stopPropagation();


					if (!this.opts.dragImageUpload && !this.opts.dragFileUpload)
					{
						return;
					}

					var files = e.dataTransfer.files;
					this.upload.directUpload(files[0], e);
				},
				drop: function(e)
				{
					this.core.callback('drop', e);
				},
				isCallback: function(name)
				{
					return (typeof this.opts.callbacks[name] !== 'undefined' && $.isFunction(this.opts.callbacks[name]));
				}
			};
		},

		// =file
		file: function()
		{
			return {
				show: function()
				{
					// build modal
					this.modal.load('file', this.lang.get('file'), 700);

					// build upload
					this.upload.init('#redactor-modal-file-upload', this.opts.fileUpload, this.file.insert);

					// get text
					var text = this.selection.get().toString();

					$('#redactor-filename').val(text);

					this.modal.show();
				},
				insert: function(json, direct, e)
				{
					// error callback
					if (typeof json.error !== 'undefined')
					{
						this.modal.close();
						this.core.callback('fileUploadError', json);
						return;
					}

					this.placeholder.remove();

					var $link;
					var text;
					var $el = (this.utils.isElement(json)) ? $(json) : false;

					// direct upload
					if (direct)
					{
						text = json.filename;

						this.selection.removeMarkers();
						this.insert.nodeToCaretPositionFromPoint(e, this.selection.marker());
						this.selection.restore();
					}
					else
					{
						text = (typeof text === 'undefined' || text === '') ? json.filename : $('#redactor-filename').val();
						this.modal.close();
					}

					// buffer
					this.buffer.set();

					this.air.collapsed();

					if ($el !== false)
					{
						$link = this.insert.node($el);
					}
					else
					{
						$link = $('<a href="' + json.filelink + '">' + text + '</a>');
						$link = this.insert.node($link);
					}

					this.caret.after($link);
					this.core.callback('fileUpload', $link, json);

				}
			};
		},

		// =focus
		focus: function()
		{
			return {
				start: function()
				{
					this.core.editor().focus();

					if (this.opts.type === 'inline')
					{
						return;
					}

					var first = this.core.editor().children().first();

					if (first.length === 0 && (first[0].length === 0 || first[0].tagName === 'BR' || first[0].nodeType === 3))
					{
						return;
					}

					if (first[0].tagName === 'UL' || first[0].tagName === 'OL')
					{
						first = first.find('li').first();
					}

					this.caret.start(first);
				},
				end: function()
				{
					this.core.editor().focus();

					var last = (this.opts.inline) ? this.core.editor() : this.focus.last();
					var sel = this.selection.get();
					var range = this.selection.range(sel);

					if (last.length === 0)
					{
						return;
					}

					var lastNode = last[0].lastChild;
					if (!this.browser.webkit() && typeof lastNode !== 'undefined' && this.utils.isInlineTag(lastNode.tagName))
					{
						this.caret.end(lastNode);
					}
					else
					{
						range.selectNodeContents(last[0]);
						range.collapse(false);

						this.selection.update(sel, range);
					}
				},
				last: function()
				{
					return this.core.editor().children().last();
				},
				is: function()
				{
					return this.core.editor()[0] === document.activeElement;
				}
			};
		},

		// =image
		image: function()
		{
			return {
				show: function()
				{
					// build modal
					this.modal.load('image', this.lang.get('image'), 700);

					// build upload
					this.upload.init('#redactor-modal-image-droparea', this.opts.imageUpload, this.image.insert);
					this.modal.show();

				},
				insert: function(json, direct, e)
				{
					// error callback
					if (typeof json.error !== 'undefined')
					{
						this.modal.close();
						this.core.callback('imageUploadError', json);
						return;
					}

					this.placeholder.remove();

					var $figure = $('<figure>');

					var $img;
					if (this.utils.isElement(json))
					{
						$img = $(json);
					}
					else
					{
						$img = $('<img>');
						$img.attr('src', json.filelink);
					}

					$figure.append($img);

					var pre = this.utils.isTag(this.selection.current(), 'pre');

					if (direct)
					{

						this.air.collapsed();
						this.selection.removeMarkers();
						var node = this.insert.nodeToCaretPositionFromPoint(e, this.selection.marker());
						var $next = $(node).next();

						this.selection.restore();

						// buffer
						this.buffer.set();

						// insert
						if (typeof $next !== 'undefined' && $next.length !== 0 && $next[0].tagName === 'IMG')
						{
							// delete callback
							this.core.callback('imageDelete', $next[0].src, $next);

							// replace
							$next.closest('figure, p', this.core.editor()[0]).replaceWith($figure);
							this.caret.after($figure);
						}
						else
						{
							if (pre)
							{
								$(pre).after($figure);
							}
							else
							{
								this.insert.node($figure);
							}

							this.caret.after($figure);
						}

					}
					else
					{
						this.modal.close();

						// buffer
						this.buffer.set();

						// insert
						this.air.collapsed();

						if (pre)
						{
							$(pre).after($figure);
						}
						else
						{
							this.insert.node($figure);
						}

						this.caret.after($figure);
					}

					this.observe.load();
					this.core.callback('imageUpload', $img, json);
				},
				setEditable: function($image)
				{
					$image.on('dragstart', function(e)
					{
						e.preventDefault();
					});

					$image.off('click.redactor touchstart.redactor').on('click.redactor touchstart.redactor', $.proxy(function()
					{
						this.image.showEdit($image);

					}, this));
				},
				showEdit: function($image)
				{
					this.observe.image = $image;

					var $link = $image.closest('a', this.$editor[0]);

					this.modal.load('image-edit', this.lang.get('edit'), 705);

					this.modal.createCancelButton();
					this.image.buttonDelete = this.modal.createDeleteButton(this.lang.get('delete'));
					this.image.buttonSave = this.modal.createActionButton(this.lang.get('save'));

					this.image.buttonDelete.on('click', $.proxy(this.image.remove, this));
					this.image.buttonSave.on('click', $.proxy(this.image.update, this));


					$('#redactor-image-title').val($image.attr('alt'));

					var $redactorImageLink = $('#redactor-image-link');
					$redactorImageLink.attr('href', $image.attr('src'));
					if ($link.length !== 0)
					{
						$redactorImageLink.val($link.attr('href'));
						if ($link.attr('target') === '_blank')
						{
							$('#redactor-image-link-blank').prop('checked', true);
						}
					}

					// hide link's tooltip
					$('.redactor-link-tooltip').remove();

					this.modal.show();

					// focus
					$('#redactor-image-title').focus();

				},
				update: function()
				{
					var $image = this.observe.image;
					var $link = $image.closest('a', this.core.editor()[0]);

					var title = $('#redactor-image-title').val().replace(/(<([^>]+)>)/ig,"");
					$image.attr('alt', title).attr('title', title);

					// as link
					var link = $.trim($('#redactor-image-link').val()).replace(/(<([^>]+)>)/ig,"");
					if (link !== '')
					{
						// test url (add protocol)
						var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}';
						var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
						var re2 = new RegExp('^' + pattern, 'i');

						if (link.search(re) === -1 && link.search(re2) === 0 && this.opts.linkProtocol)
						{
							link = this.opts.linkProtocol + '://' + link;
						}

						var target = ($('#redactor-image-link-blank').prop('checked')) ? true : false;

						if ($link.length === 0)
						{
							var a = $('<a href="' + link + '">' + this.utils.getOuterHtml($image) + '</a>');
							if (target)
							{
								a.attr('target', '_blank');
							}

							$image.replaceWith(a);
						}
						else
						{
							$link.attr('href', link);
							if (target)
							{
								$link.attr('target', '_blank');
							}
							else
							{
								$link.removeAttr('target');
							}
						}
					}
					else if ($link.length !== 0)
					{
						$link.replaceWith(this.utils.getOuterHtml($image));

					}

					this.modal.close();

					// buffer
					this.buffer.set();

					this.observe.images();

				},
				detectRemoved: function(self, mutation)
				{
					if (self.events.stop)
					{
						return;
					}

			  		var len = mutation.removedNodes.length;
			  		for (var i = 0; i < len; i++)
			  		{
				  		var node = mutation.removedNodes[i];
				  		if (node.nodeType === 1)
				  		{
					  		var children = $(node).children('img');
					  		if (node.tagName !== 'IMG' && children.length !== 0)
					  		{
						  		var lenChildren = children.length;
					  			for (var z = 0; z < lenChildren; z++)
					  			{
						  			self.image.remove(false, $(children[z]));
					  			}
					  		}
					  		else if (node.tagName === 'IMG' && mutation.nextSibling === null)
					  		{
					  			self.image.remove(true, $(node));
					  		}
				  			else if (node.tagName === 'IMG' && (typeof mutation.nextSibling !== null && mutation.nextSibling.id !== 'redactor-image-box'))
				  			{
					  			self.image.remove(true, $(node));
				  			}
				  		}
			  		}
				},
				remove: function(e, $image)
				{
					$image = (typeof $image === 'undefined') ? $(this.observe.image) : $image;

					var $link = $image.closest('a', this.core.editor()[0]);
					var $figure = $image.closest('figure, p', this.core.editor()[0]);
					var $parent = $image.parent();

					if ($('#redactor-image-box').length !== 0)
					{
						$parent = $('#redactor-image-box').parent();
					}

					var $next;
					if ($figure.length !== 0)
					{
						$next = $figure.next();
						$figure.remove();
					}
					else if ($link.length !== 0)
					{
						$parent = $link.parent();
						$link.remove();
					}
					else
					{
						$image.remove();
					}

					$('#redactor-image-box').remove();

					if (e !== false)
					{
						if ($figure.length !== 0 && $next.length !== 0)
						{
							this.caret.start($next);
						}
						else if ($parent.length !== 0)
						{
							this.caret.start($parent);
						}
					}

					if (typeof e !== 'boolean')
					{
						this.modal.close();
					}

					// delete callback
					this.core.callback('imageDelete', $image[0].src, $image);
					this.utils.restoreScroll();
				}
			};
		},

		// =indent
		indent: function()
		{
			return {
				increase: function()
				{
					if (!this.list.get())
					{
						return;
					}

					var $li = $(this.selection.current()).closest('li');
					var $prev = $li.prev();
					if ($prev.length === 0 || $prev[0].tagName !== 'LI')
					{
						return;
					}

					this.buffer.set();

					document.execCommand('indent');

					// normalize
					this.selection.save();
					this.indent.normalize();
					this.selection.restore();
				},
				decrease: function()
				{
					if (!this.list.get())
					{
						return;
					}

					this.buffer.set();

					document.execCommand('outdent');

					var $item = $(this.selection.current()).closest('li', this.core.editor()[0]);

					if (this.utils.isCollapsed())
					{
						var $li = $(this.selection.current()).closest('li');
						if ($li.length !== 0 && $li.parent().length !== 0 && $li.parent()[0].tagName === 'LI')
						{
							this.selection.save();
							$li.parent().after($li);
							this.selection.restore();
						}
					}

					if ($item.length === 0)
					{
						document.execCommand('formatblock', false, 'p');
					}
				},
				normalize: function()
				{
					this.core.editor().find('li').each(function(i,s)
					{
						var $next = $(s).next();
						if ($next.length !== 0 && ($next[0].tagName === 'UL' || $next[0].tagName === 'OL'))
						{
							$(s).append($next);
						}

					});
				}
			};
		},

		// =inline
		inline: function()
		{
			return {
				format: function(tag, attr, value, type)
				{
					tag = tag.toLowerCase();

					if (tag === 'span')
					{
						return;
					}

					// Stop formatting pre and headers
					if (this.utils.isCurrentOrParent(['PRE', 'TR']) || this.utils.isCurrentOrParentHeader())
					{
						return;
					}

					var tags = ['b', 'bold', 'i', 'italic', 'underline', 'strikethrough', 'deleted', 'superscript', 'subscript'];
					var replaced = ['strong', 'strong', 'em', 'em', 'u', 'del', 'del', 'sup', 'sub'];

					for (var i = 0; i < tags.length; i++)
					{
						if (tag === tags[i])
						{
							tag = replaced[i];
						}
					}

					this.placeholder.remove();
					this.buffer.set();

					return (this.utils.isCollapsed()) ? this.inline.formatCollapsed(tag, attr, value, type) : this.inline.formatUncollapsed(tag, attr, value, type);
				},
				formatCollapsed: function(tag, attr, value, type)
				{
					var inline = this.selection.inline();

					if (inline)
					{
						var currentTag = inline.tagName.toLowerCase();

						if (currentTag === tag)
						{
							// empty & remove
							if (this.utils.isEmpty(inline.innerHTML))
							{
								this.caret.after(inline);
								$(inline).remove();
							}
							// break & remove
							else
							{
								var $first = this.inline.insertBreakpoint(inline, currentTag);

								this.caret.after($first);
							}
						}
						else
						{
							this.inline.formatSet(tag, attr, value, type);
						}
					}
					else
					{
						this.inline.formatSet(tag, attr, value, type);
					}

				},
				formatSet: function(tag, attr, value, type)
				{
					var node = document.createElement(tag);
					node = this.inline.setAttr(node, attr, value, type);

					this.insert.node(node);
					this.caret.start(node);
				},
				formatBreak: function(tag, attr, value, type, inline, currentTag)
				{
					var node = document.createElement(tag);
					node = this.inline.setAttr(node, attr, value, type);

					var $first = this.inline.insertBreakpoint(inline, currentTag);
					$first.after(node);

					this.caret.start(node);
				},
				formatUncollapsed: function(tag, attr, value, type)
				{
					var self = this;

					this.inline.formatConvert(tag);

					this.selection.save();

					document.execCommand('strikethrough');

					var $formatted = this.core.editor().find('strike');
					$formatted.each(function(i,s)
					{
						var $oldEl = $(s);
						var newEl = document.createElement(tag);

						if (!$oldEl.hasClass('redactor-inline-converted'))
						{
							newEl = self.inline.setAttr(newEl, attr, value, type);
						}

						var $newEl = $(newEl);

						$oldEl.replaceWith($newEl.html($oldEl.contents()));

					});

					// restore del tag
					if (tag !== 'del')
					{
						this.core.editor().find('inline').each(function(i,s)
						{
							self.utils.replaceToTag(s, 'del');
						});
					}

					// restore u tag
					if (tag !== 'u')
					{
						this.core.editor().find('unline').each(function(i,s)
						{
							self.utils.replaceToTag(s, 'u');
						});
					}

					// remove format in pre & headers
					this.core.editor().find('pre, h1, h2, h3, h4, h5, h6').children(tag).replaceWith(function()
					{
						return $(this).contents();
					});

					// clear text decoration & service tags
					this.$editor.find(this.opts.inlineTags.join(', ')).each($.proxy(function(i,s)
					{
						var $el = $(s);
						var property = $el.css('text-decoration');

						if ($el.hasClass('redactor-selection-marker'))
						{
							return;
						}
						else if (this.clean.removeSpacesHard(s.innerHTML) === '')
						{
							$el.remove();
							return;
						}
						else if (s.tagName === 'SPAN' && $el.hasClass('redactor-inline-converted'))
						{
							$el.replaceWith($el.contents());
							return;
						}
						else if (property === 'line-through')
						{
							if (s.tagName === 'SPAN' || (s.tagName === 'U' && s.attributes.length === 0))
							{
								$el.replaceWith($el.contents());
							}
							else
							{
								$el.css('text-decoration', '');
								this.utils.removeEmptyAttr($el, 'style');
							}
						}
					}, this));

					this.selection.restore();

				},
				formatConvert: function(tag)
				{
					this.selection.save();

					var self = this;

					// save del tag
					if (tag !== 'del')
					{

						this.core.editor().find('del').each(function(i,s)
						{
							self.utils.replaceToTag(s, 'inline');
						});
					}

					// save u tag
					if (tag !== 'u')
					{
						this.core.editor().find('u').each(function(i,s)
						{
							self.utils.replaceToTag(s, 'unline');
						});
					}

					// convert tag
					this.core.editor().find(tag).each(function()
					{
						var $el = $(this);
						$el.replaceWith($('<strike />').addClass('redactor-inline-converted').html($el.contents()));

					});

					this.selection.restore();
				},
				insertBreakpoint: function(inline, currentTag)
				{
					var breakpoint = document.createElement('span');
					breakpoint.id = 'redactor-inline-breakpoint';

					breakpoint = this.insert.node(breakpoint);

					var end = this.utils.isEndOfElement(inline);
					var code = this.utils.getOuterHtml(inline);

					var endTag = (end) ? '' : '<' + currentTag + '>';

					code = code.replace(/<span(.*?[^>])id="redactor-inline-breakpoint">​<\/span>/i, '</' + currentTag + '>' + endTag);

					var $code = $(code);
					$(inline).replaceWith($code);

					return $code.first();
				},
				setAttr: function(inline, attr, value, type)
				{
					if (typeof attr === 'undefined')
					{
						return inline;
					}

					var func = (typeof type === 'undefined') ? 'replace' : type;

					if (attr === 'class')
					{
						inline = this.inline[func + 'Class'](value, inline);
					}
					else
					{
						if (func === 'remove')
						{
							inline = this.inline[func + 'Attr'](attr, inline);
						}
						else if (func === 'removeAll')
						{
							inline = this.inline[func + 'Attr'](inline);
						}
						else
						{
							inline = this.inline[func + 'Attr'](attr, value, inline);
						}
					}

					return inline;

				},
				getInlines: function(inline)
				{
					return (typeof inline === 'undefined') ? this.selection.inlines() : inline;
				},
				update: function(tag, attr, value, type)
				{
					var inlines = this.selection.inlines();
					var result = [];
					var self = this;

					$.each(inlines, function(i,s)
					{
						if ($.isArray(tag))
						{
							if ($.inArray(s.tagName.toLowerCase(), tag) === -1)
							{
								return;
							}
						}
						else
						{
							if (tag !== '*' && s.tagName.toLowerCase() !== tag)
							{
								return;
							}
						}

						result.push(self.inline.setAttr(s, attr, value, type));

					});

					return result;

				},
				replaceClass: function(value, inline)
				{
					return $(this.inline.getInlines(inline)).removeAttr('class').addClass(value)[0];
				},
				toggleClass: function(value, inline)
				{
					return $(this.inline.getInlines(inline)).toggleClass(value)[0];
				},
				addClass: function(value, inline)
				{
					return $(this.inline.getInlines(inline)).addClass(value)[0];
				},
				removeClass: function(value, inline)
				{
					return $(this.inline.getInlines(inline)).removeClass(value)[0];
				},
				removeAllClass: function(inline)
				{
					return $(this.inline.getInlines(inline)).removeAttr('class')[0];
				},
				replaceAttr: function(inline, attr, value)
				{
					inline = this.inline.removeAttr(attr, this.inline.getInlines(inline));

					return $(inline).attr(attr, value)[0];
				},
				toggleAttr: function(attr, value, inline)
				{
					inline = this.inline.getInlines(inline);

					var self = this;
					var returned = [];
					$.each(inline, function(i,s)
					{
						var $el = $(s);
						if ($el.attr(attr))
						{
							returned.push(self.inline.removeAttr(attr, s));
						}
						else
						{
							returned.push(self.inline.addAttr(attr, value, s));
						}
					});

					return returned;

				},
				addAttr: function(attr, value, inline)
				{
					return $(this.inline.getInlines(inline)).attr(attr, value)[0];
				},
				removeAttr: function(attr, inline)
				{
					return $(this.inline.getInlines(inline)).removeAttr(attr)[0];
				},
				removeAllAttr: function(inline)
				{
					inline = this.inline.getInlines(inline);

					var returned = [];
					$.each(inline, function(i, s)
					{
						if (typeof s.attributes === 'undefined')
						{
							returned.push(s);
						}

						var $el = $(s);
						var len = s.attributes.length;
						for (var z = 0; z < len; z++)
						{
							$el.removeAttr(s.attributes[z].name);
						}

						returned.push($el[0]);
					});

					return returned;
				},
				removeFormat: function()
				{
					document.execCommand('removeFormat');
				}
			};
		},

		// =insert
		insert: function()
		{
			return {
				set: function(html)
				{
					this.code.set(html);
				},
				text: function(text)
				{
					this.placeholder.remove();

					text = text.toString();
					text = $.trim(text);

					var tmp = document.createElement('div');
					tmp.innerHTML = text;
					text = tmp.textContent || tmp.innerText;

					text = text.replace(/\n/g, ' ');

					// select all
					if (this.utils.isSelectAll())
					{
						var $node = $(this.opts.emptyHtml);
						this.core.editor().html('').append($node);
						$node.html(text);
						this.caret.end($node);
					}
					else
					{
						// insert
						var sel = this.selection.get();
						var node = document.createTextNode(text);

						if (sel.getRangeAt && sel.rangeCount)
						{
							var range = sel.getRangeAt(0);
							range.deleteContents();
							range.insertNode(node);
							range.setStartAfter(node);
							range.collapse(true);

							this.selection.update(sel, range);
						}
					}

					this.utils.disableSelectAll();
					this.linkify.format();
				},
				raw: function(html)
				{
					this.insert.gap = true;
					this.insert.html(html, false);

				},
				html: function(html, clean)
				{
					this.core.editor().focus();

					var block = this.selection.block();
					var inline = this.selection.inline();

					// clean
					if (clean !== false)
					{
						html = this.clean.onPaste(html, true);
					}

					// delete selected content
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					range.deleteContents();

					this.selection.update(sel, range);

					// save selection
					this.selection.save();

					// inserted marker
					var node = document.createElement('span');
					node.id = 'redactor-insert-marker';
					node = this.insert.node(node);

					if (this.insert.gap && block)
					{
						if (this.utils.isSelectAll())
						{
							this.core.editor().html(html);
							this.focus.end();
						}
						else
						{
							this.events.stopDetect();

							var tag = block.tagName.toLowerCase();
							if (tag !== 'p' || tag !== 'div')
							{
								tag = 'p';
							}

							var inlineStart = '', inlineEnd = '';
							if (inline)
							{
								inlineStart = '</' + inline.tagName.toLowerCase() + '>';
								inlineEnd = '<' + inline.tagName.toLowerCase() + '>';
							}

							var code = this.core.editor().html();

							code = code.replace(/<span(.*?[^>])id="redactor-insert-marker">​<\/span>/i, inlineStart + '</' + tag + '>' + html + '<' + tag + '>' + inlineEnd);
							this.core.editor().html(code);

							this.selection.restore();

							var current = this.selection.current();
							if (current && current.tagName === 'P' && current.innerHTML === '')
							{
								this.caret.before(current);
							}

							this.core.editor().find('p:empty').remove();
							this.events.startDetect();
						}

					}
					else
					{
						if (inline)
						{
							// remove same tag inside
							var $div = $("<div/>").html($.parseHTML(html, document, true));

							$div.find(inline.tagName.toLowerCase()).each(function()
							{
								$(this).contents().unwrap();
							});

							html = $div.html();
						}

						if (this.utils.isSelectAll())
						{
							var $node = $(this.opts.emptyHtml);
							this.core.editor().html('').append($node);
							$node.html(html);
							this.caret.end($node);
						}
						else
						{
							$(node).before(html);
							this.selection.restore();
							this.caret.after(node);
							$(node).remove();
						}


					}


					this.utils.disableSelectAll();
					this.linkify.format();

				},
				node: function(node, deleteContent)
				{
					if (typeof this.start !== 'undefined')
					{
						this.core.editor().focus();
					}

					node = node[0] || node;

					var block = this.selection.block();
					var gap = this.utils.isBlockTag(node.tagName);

					if (gap && block)
					{
						this.events.stopDetect();

						var inline = this.selection.inline();
						var tag = block.tagName.toLowerCase();

						if (tag !== 'p' || tag !== 'div')
						{
							tag = 'p';
						}

						var inlineStart = '', inlineEnd = '';
						if (inline)
						{
							inlineStart = '</' + inline.tagName.toLowerCase() + '>';
							inlineEnd = '<' + inline.tagName.toLowerCase() + '>';
						}

						// inserted marker
						var marker = document.createElement('span');
						marker.id = 'redactor-insert-marker';

						this.insert.node(marker);

						var code = this.core.editor().html();
						code = code.replace(/<span(.*?[^>])id="redactor-insert-marker">​<\/span>/i, inlineStart + '</' + tag + '><span id="redactor-insert-marker">​</span><' + tag + '>' + inlineEnd);
						this.core.editor().html(code);

						var $marker = this.core.editor().find('#redactor-insert-marker');

						$marker.replaceWith(node);

						var current = this.selection.current();
						if (current && current.tagName === 'P' && current.innerHTML === '')
						{
							this.caret.before(current);
						}

						this.core.editor().find('p:empty').remove();
						this.events.startDetect();
					}
					else
					{
						var sel = this.selection.get();
						var range = this.selection.range(sel);

						if (deleteContent !== false)
						{
							range.deleteContents();
						}

						range.insertNode(node);
						range.collapse(false);

						this.selection.update(sel, range);
					}

					this.caret.end(node);

					return node;

				},
				nodeToCaretPositionFromPoint: function(e, node)
				{
					node = node[0] || node;

					var range;
					var x = e.clientX, y = e.clientY;
					if (document.caretPositionFromPoint)
					{
					    var pos = document.caretPositionFromPoint(x, y);
					    var sel = document.getSelection();
					    range = sel.getRangeAt(0);
					    range.setStart(pos.offsetNode, pos.offset);
					    range.collapse(true);
					    range.insertNode(node);
					}
					else if (document.caretRangeFromPoint)
					{
					    range = document.caretRangeFromPoint(x, y);
					    range.insertNode(node);
					}
					else if (typeof document.body.createTextRange !== "undefined")
					{
				        range = document.body.createTextRange();
				        range.moveToPoint(x, y);
				        var endRange = range.duplicate();
				        endRange.moveToPoint(x, y);
				        range.setEndPoint("EndToEnd", endRange);
				        range.select();
					}

					return node;

				},
				marker: function(range, node, collapse)
				{
					if (range === null)
					{
						return;
					}

					range = range.cloneRange();

					try {
						range.collapse(collapse);
						range.insertNode(node);

					}
					catch (e)
					{
						this.focus.start();
					}

				}

			};
		},

		// =keydown
		keydown: function()
		{
			return {
				init: function(e)
				{
					if (this.rtePaste)
					{
						return;
					}

					var key = e.which;
					var arrow = (key >= 37 && key <= 40);

					this.keydown.ctrl = e.ctrlKey || e.metaKey;
					this.keydown.parent = this.selection.parent();
					this.keydown.current = this.selection.current();
					this.keydown.block = this.selection.block();

			        // detect tags
					this.keydown.pre = this.utils.isTag(this.keydown.current, 'pre');
					this.keydown.blockquote = this.utils.isTag(this.keydown.current, 'blockquote');
					this.keydown.figcaption = this.utils.isTag(this.keydown.current, 'figcaption');

					// callback
					var keydownStop = this.core.callback('keydown', e);
					if (keydownStop === false)
					{
						e.preventDefault();
						return false;
					}

					// shortcuts setup
					this.shortcuts.init(e, key);

					// buffer
					if (this.utils.isDesktop())
					{
						this.keydown.checkEvents(arrow, key);
						this.keydown.setupBuffer(e, key);
					}

					this.keydown.addArrowsEvent(arrow);
					this.keydown.setupSelectAll(e, key);

					// turn off enter key
					if (!this.opts.enterKey && key === this.keyCode.ENTER)
					{
						e.preventDefault();

						// remove selected
						var sel = this.selection.get();
						var range = this.selection.range(sel);

						if (!range.collapsed)
						{
							range.deleteContents();
						}

						return;
					}

					// down
					if (this.opts.enterKey && key === this.keyCode.DOWN)
					{
						this.keydown.onArrowDown();
					}

					// up
					if (this.opts.enterKey && key === this.keyCode.UP)
					{
						this.keydown.onArrowUp();
					}

					// on enter
					if (key === this.keyCode.ENTER && !e.shiftKey && !e.ctrlKey && !e.metaKey)
					{
						var stop = this.core.callback('enter', e);
						if (stop === false)
						{
							e.preventDefault();
							return false;
						}

						// blockquote exit
						if (this.keydown.blockquote && this.keydown.exitFromBlockquote(e) === true)
						{
							return false;
						}

						// pre
						if (this.keydown.pre)
						{
							return this.keydown.insertNewLine(e);
						}
						// blockquote & figcaption
						else if (this.keydown.blockquote || this.keydown.figcaption)
						{
							return this.keydown.insertBreakLine(e);
						}
						// paragraphs
						else if (this.keydown.block)
						{
							setTimeout($.proxy(this.keydown.replaceDivToParagraph, this), 1);

							// empty list exit
							if (this.keydown.block.tagName === 'LI')
							{
								var current = this.selection.current();
								var $parent = $(current).closest('li', this.$editor[0]);
								var $list = $parent.closest('ul,ol', this.$editor[0]);

								if ($parent.length !== 0 && this.utils.isEmpty($parent.html()) && $list.next().length === 0 && this.utils.isEmpty($list.find("li").last().html()))
								{
									$list.find("li").last().remove();

									var node = $(this.opts.emptyHtml);
									$list.after(node);
									this.caret.start(node);

									return false;
								}
							}

						}
						// outside
						else if (!this.keydown.block)
						{
							return this.keydown.insertParagraph(e);
						}

					}

					// tab or cmd + [
					if (key === this.keyCode.TAB || e.metaKey && key === 221 || e.metaKey && key === 219)
					{
						return this.keydown.onTab(e, key);
					}

					// on Shift+Enter or Ctrl+Enter
					if (key === this.keyCode.ENTER && (e.ctrlKey || e.shiftKey))
					{
						return this.keydown.insertBreakLine(e);
					}

					// backspace & delete
					if (key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE)
					{
						this.utils.saveScroll();
					}

					// delete
					if (key === this.keyCode.DELETE && $('#redactor-image-box').length !== 0)
					{
						this.image.remove();
					}

					// backspace
					if (key === this.keyCode.BACKSPACE)
					{

						// backspace as outdent
						var block = this.selection.block();
						if (block && block.tagName === 'LI' && this.utils.isCollapsed() && this.utils.isStartOfElement())
						{
							this.indent.decrease();
							e.preventDefault();
							return;
						}

						// remove hr in FF
						if (this.browser.ff())
						{
							var prev = this.selection.prev();
							var prev2 = $(prev).prev()[0];

							if (prev && prev.tagName === 'HR')
							{
								$(prev).remove();
							}

							if (prev2 && prev2.tagName === 'HR')
							{
								$(prev2).remove();
							}
						}

						this.keydown.removeInvisibleSpace();
						this.keydown.removeEmptyListInTable(e);

						// remove style tag
						setTimeout($.proxy(function()
						{
							this.code.syncFire = false;
							this.keydown.removeEmptyLists();

							this.core.editor().find('*[style]').not('#redactor-image-box, #redactor-image-editter').removeAttr('style');

							this.keydown.formatEmpty(e);
							this.code.syncFire = true;

						}, this), 1);
					}

				},
				checkEvents: function(arrow, key)
				{
					if (!arrow && (this.core.getEvent() === 'click' || this.core.getEvent() === 'arrow'))
					{
						this.core.addEvent(false);

						if (this.keydown.checkKeyEvents(key))
						{
							this.buffer.set();
						}
					}
				},
				checkKeyEvents: function(key)
				{
					var k = this.keyCode;
					var keys = [k.BACKSPACE, k.DELETE, k.ENTER, k.ESC, k.TAB, k.CTRL, k.META, k.ALT, k.SHIFT];

					return ($.inArray(key, keys) === -1) ? true : false;

				},
				addArrowsEvent: function(arrow)
				{
					if (!arrow)
					{
						return;
					}

					if ((this.core.getEvent() === 'click' || this.core.getEvent() === 'arrow'))
					{
						this.core.addEvent(false);
						return;
					}

				    this.core.addEvent('arrow');
				},
				setupBuffer: function(e, key)
				{
					if (this.keydown.ctrl && key === 90 && !e.shiftKey && !e.altKey && this.opts.buffer.length) // z key
					{
						e.preventDefault();
						this.buffer.undo();
						return;
					}
					// undo
					else if (this.keydown.ctrl && key === 90 && e.shiftKey && !e.altKey && this.opts.rebuffer.length !== 0)
					{
						e.preventDefault();
						this.buffer.redo();
						return;
					}
					else if (!this.keydown.ctrl)
					{
						if (key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE || (key === this.keyCode.ENTER && !e.ctrlKey && !e.shiftKey))
						{
							this.buffer.set();
						}
					}
				},
				exitFromBlockquote: function(e)
				{

					if (!this.utils.isEndOfElement(this.keydown.blockquote))
					{
						return;
					}

					var tmp = this.clean.removeSpacesHard($(this.keydown.blockquote).html());
					if (tmp.search(/(<br\s?\/?>){3}$/i) !== -1)
					{
						e.preventDefault();

						var $last = $(this.keydown.blockquote).children().last().prev();

						$last.prev().filter('br').remove();
						$last.filter('br').remove();


						var node = $(this.opts.emptyHtml);
						$(this.keydown.blockquote).after(node);
						this.caret.start(node);

						return true;

					}

					return;

				},
				onArrowDown: function()
				{
					var tags = [this.keydown.blockquote, this.keydown.pre, this.keydown.figcaption];

					for (var i = 0; i < tags.length; i++)
					{
						if (tags[i])
						{
							this.keydown.insertAfterLastElement(tags[i]);
							return false;
						}
					}
				},
				onArrowUp: function()
				{
					var tags = [this.keydown.blockquote, this.keydown.pre, this.keydown.figcaption];

					for (var i = 0; i < tags.length; i++)
					{
						if (tags[i])
						{
							this.keydown.insertBeforeFirstElement(tags[i]);
							return false;
						}
					}
				},
				insertAfterLastElement: function(element)
				{
					if (!this.utils.isEndOfElement())
					{
						return;
					}

					if (this.$editor.contents().last()[0] !== element)
					{
						return;
					}

					var node = $(this.opts.emptyHtml);
					$(element).after(node);
					this.caret.start(node);

				},
				insertBeforeFirstElement: function(element)
				{
					if (!this.utils.isStartOfElement())
					{
						return;
					}

					if (this.$editor.contents().length > 1 && this.$editor.contents().first()[0] !== element)
					{
						return;
					}

					var node = $(this.opts.emptyHtml);
					$(element).before(node);
					this.caret.start(node);

				},
				onTab: function(e, key)
				{
					if (!this.opts.tabKey)
					{
						return true;
					}

					if (this.utils.isEmpty(this.code.get()) && this.opts.tabAsSpaces === false)
					{
						return true;
					}

					e.preventDefault();
					this.buffer.set();

					var node;
					if (this.keydown.pre && !e.shiftKey)
					{
						node = (this.opts.preSpaces) ? document.createTextNode(Array(this.opts.preSpaces + 1).join('\u00a0')) : document.createTextNode('\t');
						this.insert.node(node);
					}
					else if (this.opts.tabAsSpaces !== false)
					{
						node = document.createTextNode(Array(this.opts.tabAsSpaces + 1).join('\u00a0'));
						this.insert.node(node);
					}
					else
					{
						if (e.metaKey && key === 219)
						{
							this.indent.decrease();
						}
						else if (e.metaKey && key === 221)
						{
							this.indent.increase();
						}
						else if (!e.shiftKey)
						{
							this.indent.increase();
						}
						else
						{
							this.indent.decrease();
						}
					}

					return false;
				},
				setupSelectAll: function(e, key)
				{
					if (this.keydown.ctrl && key === 65)
					{
						this.utils.enableSelectAll();
					}
					else if (key !== this.keyCode.LEFT_WIN && !this.keydown.ctrl)
					{
						this.utils.disableSelectAll();
					}
				},
				insertNewLine: function(e)
				{
					e.preventDefault();

					var node = document.createTextNode('\n');

					var sel = this.selection.get();
					var range = this.selection.range(sel);

					range.deleteContents();
					range.insertNode(node);

					this.caret.after(node);

					return false;
				},
				insertBreakLine: function(e)
				{
					return this.keydown.insertBreakLineProcessing(e);
				},
				insertDblBreakLine: function(e)
				{
					return this.keydown.insertBreakLineProcessing(e, true);
				},
				insertBreakLineProcessing: function(e, dbl)
				{
					e.stopPropagation();

					var br1 = document.createElement('br');
					this.insert.node(br1);

					if (dbl === true)
					{
						var br2 = document.createElement('br');
						this.insert.node(br2);
					}

					return false;

				},
				replaceDivToParagraph: function()
				{
					var blockElem = this.selection.block();
					var blockHtml = blockElem.innerHTML.replace(/<br\s?\/?>/gi, '');
					if (blockElem.tagName === 'DIV' && this.utils.isEmpty(blockHtml) && !$(blockElem).hasClass('redactor-in'))
					{
						var p = document.createElement('p');
						$(blockElem).replaceWith(p);
						this.caret.start(p);

						return false;
					}
					else if (this.opts.cleanStyleOnEnter && blockElem.tagName === 'P')
					{
						$(blockElem).removeAttr('class').removeAttr('style');
					}
				},
				removeInvisibleSpace: function()
				{
					var $current = $(this.keydown.current);
					if ($current.text().search(/^\u200B$/g) === 0)
					{
						$current.remove();
					}
				},
				removeEmptyListInTable: function(e)
				{
					var $current = $(this.keydown.current);
					var $parent = $(this.keydown.parent);
					var td = $current.closest('td', this.$editor[0]);

					if (td.length !== 0 && $current.closest('li', this.$editor[0]) && $parent.children('li').length === 1)
					{
						if (!this.utils.isEmpty($current.text()))
						{
							return;
						}

						e.preventDefault();

						$current.remove();
						$parent.remove();

						this.caret.start(td);
					}
				},
				removeEmptyLists: function()
				{
					var removeIt = function()
					{
						var html = $.trim(this.innerHTML).replace(/\/t\/n/g, '');
						if (html === '')
						{
							$(this).remove();
						}
					};

					this.core.editor().find('li').each(removeIt);
					this.core.editor().find('ul, ol').each(removeIt);
				},
				formatEmpty: function(e)
				{
					var html = $.trim(this.core.editor().html());

					if (!this.utils.isEmpty(html))
					{
						return;
					}

					e.preventDefault();

					if (this.opts.type === 'inline' || this.opts.type === 'pre')
					{
						this.core.editor().html(this.selection.markerHtml());
						this.selection.restore();
					}
					else
					{
						this.core.editor().html(this.opts.emptyHtml);
						this.focus.start();
					}

					return false;

				}
			};
		},

		// =keyup
		keyup: function()
		{
			return {
				init: function(e)
				{
					if (this.rtePaste)
					{
						return;
					}

					var key = e.which;

					// callback
					var stop = this.core.callback('keyup', e);
					if (stop === false)
					{
						e.preventDefault();
						return false;
					}

					// linkify
					if (this.linkify.isKey(key))
					{
						this.linkify.format();
					}

				}

			};
		},

		// =lang
		lang: function()
		{
			return {
				load: function()
				{
					this.opts.curLang = this.opts.langs[this.opts.lang];
				},
				get: function(name)
				{
					return (typeof this.opts.curLang[name] !== 'undefined') ? this.opts.curLang[name] : '';
				}
			};
		},

		// =line
		line: function()
		{
			return {
				insert: function()
				{
					this.buffer.set();
					this.insert.html('<hr>');
				}
			};
		},

		// =link
		link: function()
		{
			return {
				show: function(e)
				{
					if (typeof e !== 'undefined' && e.preventDefault)
					{
						e.preventDefault();
					}

					// hide link's tooltip
					$('.redactor-link-tooltip').remove();

					var isLink = (this.observe.isCurrent('a') && this.utils.isRedactorParent(this.selection.current));
					var langVarModal = (isLink) ? 'link-edit' : 'link-insert';
					var langVarBtn = (isLink) ? 'save' : 'insert';

					// build modal
					this.modal.load('link', this.lang.get(langVarModal), 600);
					this.modal.createCancelButton();

					// btn insert
					this.link.buttonInsert = this.modal.createActionButton(this.lang.get(langVarBtn));

					// get link
					this.link.getData();
					this.link.cleanUrl();

					// set modal values
					if (this.link.target === '_blank')
					{
						$('#redactor-link-blank').prop('checked', true);
					}

					this.link.$inputUrl = $('#redactor-link-url');
					this.link.$inputText = $('#redactor-link-url-text');

					this.link.$inputText.val(this.link.text);
					this.link.$inputUrl.val(this.link.url);

					// insert event
					this.link.buttonInsert.on('click', $.proxy(this.link.insert, this));

					// show modal
					this.modal.show();

					// focus
					this.link.$inputUrl.focus();

				},
				getData: function()
				{
					this.link.$node = false;
					this.link.url = '';
					this.link.target = '';

					var $el = $(this.selection.current()).closest('a', this.core.editor()[0]);
					if ($el.length !== 0 && $el[0].tagName === 'A')
					{
						this.link.$node = $el;

						this.link.url = $el.attr('href');
						this.link.text = $el.text();
						this.link.target = $el.attr('target');
					}
					else
					{
						this.link.text = this.selection.get().toString();
					}

				},
				cleanUrl: function()
				{
					if (typeof this.link.url === 'undefined')
					{
						return;
					}

					var thref = self.location.href.replace(/\/$/i, '');

					this.link.url = this.link.url.replace(thref, '');
					this.link.url = this.link.url.replace(/^\/#/, '#');
					this.link.url = this.link.url.replace('mailto:', '');

					// remove host from href
					if (!this.opts.linkProtocol)
					{
						var re = new RegExp('^(http|ftp|https)://' + self.location.host, 'i');
						this.link.url = this.link.url.replace(re, '');
					}

				},
				insert: function()
				{
					this.placeholder.remove();

					var target = '';
					var link = $.trim(this.link.$inputUrl.val());
					var text = $.trim(this.link.$inputText.val().replace(/(<([^>]+)>)/gi, ''));

					// empty text
					if (text === '' && link !== '')
					{
						text = link.replace(/<|>/g, '');
					}

					// empty link
					if (link === '' || (text === '' && link === ''))
					{
						return;
					}

					// mailto
					if (link.search('@') !== -1 && /(http|ftp|https):\/\//i.test(link) === false)
					{
						link = link.replace('mailto:', '');
						link = 'mailto:' + link;
					}
					// url, not anchor
					else if (link.search('#') !== 0)
					{
						if ($('#redactor-link-blank').prop('checked'))
						{
							target = '_blank';
						}

						// test url (add protocol)
						var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}';
						var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
						var re2 = new RegExp('^' + pattern, 'i');
						var re3 = new RegExp('\.(html|php)$', 'i');
						if (link.search(re) === -1 && link.search(re3) === -1 && link.search(re2) === 0 && this.opts.linkProtocol)
						{
							link = this.opts.linkProtocol + '://' + link;
						}
					}

					// close modal
					this.modal.close();
					this.buffer.set();

					// set link
					if (this.link.$node)
					{
						this.link.$node.attr('href', link);
						this.link.$node.text(text);

						if (target !== '')
						{
							this.link.$node.attr('target', target);
						}
						else
						{
							this.link.$node.removeAttr('target');
						}

						this.selection.node(this.link.$node);
					}
					else
					{
						// create link
						var $a = $('<a href="' + link + '">').text(text);

						// set target
						if (target !== '')
						{
							$a.attr('target', target);
						}

						$a = $(this.insert.node($a));
						this.caret.after($a);

						this.core.callback('insertedLink', $a);
					}

					this.observe.links();
				},
				unlink: function(e)
				{
					if (typeof e !== 'undefined' && e.preventDefault)
					{
						e.preventDefault();
					}

					var inlines = this.selection.inlines();
					if (!inlines)
					{
						return;
					}

					var len = inlines.length;
					var links = [];
					for (var i = 0; i < len; i++)
					{
						if (inlines[i].tagName === 'A')
						{
							links.push(inlines[i]);
						}

						var $node = $(inlines[i]).closest('a', this.core.editor()[0]);
						$node.replaceWith($node.contents());
					}

					// hide link's tooltip
					$('.redactor-link-tooltip').remove();

					this.core.callback('deletedLink', links);

				}
			};
		},

		// =linkify
		linkify: function()
		{
			return {
				isKey: function(key)
				{
					return key === this.keyCode.ENTER || key === this.keyCode.SPACE;
				},
				format: function()
				{
					if (!this.opts.linkify || this.utils.isCurrentOrParent('pre'))
					{
						return;
					}

					var linkify = this.linkify;
					var opts = this.opts.regexps;

					this.core.editor().find(":not(iframe,img,a,pre)").addBack().contents()
						.filter(function()
						{
							return this.nodeType === 3 && $.trim(this.nodeValue) !== "" && !$(this).parent().is("pre") && (this.nodeValue.match(opts.linkyoutube) || this.nodeValue.match(opts.linkvimeo) || this.nodeValue.match(opts.linkimage) || this.nodeValue.match(opts.url));
						}).each(function()
						{
							var text = $(this).text();
							var html = text;

							if (html.match(opts.linkyoutube) || html.match(opts.linkvimeo))
							{
								html = linkify.convertVideoLinks(html);
							}
							else if (html.match(opts.linkimage))
							{
								html = linkify.convertImages(html);
							}
							else
							{
								html = linkify.convertLinks(html);
							}

							$(this).before(text.replace(text, html)).remove();
						});


					var objects = this.core.editor().find('.redactor-linkify-object').each($.proxy(function(i,s)
					{
						var $el = $(s);
						$el.removeClass('redactor-linkify-object');
						if ($el.attr('class') === '')
						{
							$el.removeAttr('class');
						}

						// img figure
						if (s.tagName === 'IMG')
						{
							this.events.stopDetect();

							var block = this.selection.block();
							var inline = this.selection.inline();
							var tag = block.tagName.toLowerCase();
							var html = this.utils.getOuterHtml(s);

							// add marker
							$el.attr('data-replaced', i);

							var inlineStart = '', inlineEnd = '';
							if (inline)
							{
								inlineStart = '</' + inline.tagName.toLowerCase() + '>';
								inlineEnd = '<' + inline.tagName.toLowerCase() + '>';
							}

							var code = this.core.editor().html();
							var re = new RegExp(this.utils.getOuterHtml(s), 'i');
							code = code.replace(re, inlineStart + '</' + tag + '><figure id="redactor-inserted-figure-' + i + '">' + html + '</figure><' + tag + '>' + inlineEnd);
							this.core.editor().html(code);

							var $figure = $('#redactor-inserted-figure-' + i).removeAttr('id');
							this.caret.after($figure);

							this.events.startDetect();
						}

						return $el[0];

					}, this));

					// callback
					setTimeout($.proxy(function()
					{
						this.observe.load();
						this.core.callback('linkify', objects);
					}, this), 100);

				},
				convertVideoLinks: function(html)
				{
					var iframeStart = '<iframe class="redactor-linkify-object" width="500" height="281" src="';
					var iframeEnd = '" frameborder="0" allowfullscreen></iframe>';

					if (html.match(this.opts.regexps.linkyoutube))
					{
						html = html.replace(this.opts.regexps.linkyoutube, iframeStart + '//www.youtube.com/embed/$1' + iframeEnd);
					}

					if (html.match(this.opts.regexps.linkvimeo))
					{
						html = html.replace(this.opts.regexps.linkvimeo, iframeStart + '//player.vimeo.com/video/$2' + iframeEnd);
					}

					return html;
				},
				convertImages: function(html)
				{
					var matches = html.match(this.opts.regexps.linkimage);
					if (!matches)
					{
						return html;
					}

					return html.replace(html, '<img src="' + matches + '" class="redactor-linkify-object" />');
				},
				convertLinks: function(html)
				{
					var matches = html.match(this.opts.regexps.url);
					if (!matches)
					{
						return html;
					}

					matches = $.grep(matches, function(v, k) { return $.inArray(v, matches) === k; });

					var length = matches.length;

					for (var i = 0; i < length; i++)
					{
						var href = matches[i],
							text = href,
							linkProtocol = this.opts.linkProtocol + '://';

						if (href.match(/(https?|ftp):\/\//i) !== null)
						{
							linkProtocol = "";
						}

						if (text.length > this.opts.linkSize)
						{
							text = text.substring(0, this.opts.linkSize) + '...';
						}

						if (text.search('%') === -1)
						{
							text = decodeURIComponent(text);
						}

						var regexB = "\\b";

						if ($.inArray(href.slice(-1), ["/", "&", "="]) !== -1)
						{
							regexB = "";
						}

						// escaping url
						var regexp = new RegExp('(' + href.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + regexB + ')', 'g');

						html = html.replace(regexp, '<a href="' + linkProtocol + $.trim(href) + '" class="redactor-linkify-object">' + $.trim(text) + '</a>');
					}

					return html;
				}
			};
		},

		// =list
		list: function()
		{
			return {
				toggle: function(cmd)
				{
					if (this.utils.inBlocks(['table', 'td', 'th', 'tr']))
					{
						return;
					}

					var tag = (cmd === 'orderedlist') ? 'OL' : 'UL';
					var $list = $(this.selection.current()).parents('ul, ol').first();

					this.placeholder.remove();
					this.buffer.set();

					if ($list.length !== 0 && $list[0].tagName === tag)
					{
						this.selection.save();

						// remove list
						$list.find('ul, ol').each(function()
						{
							var parent = $(this).closest('li');
							$(this).find('li').each(function()
							{
								$(parent).after(this);
							});
						});

						$list.find('ul, ol').remove();

						$list.find('li').each(function()
						{
							return $(this).replaceWith(function()
							{
								return $('<p />').append($(this).contents());
							});
						});


						$list.replaceWith(function()
						{
							return $(this).contents();
						});

						this.selection.restore();
						return;
					}

					document.execCommand('insert' + cmd);

					var $insertedList = this.list.get();
					if (!$insertedList)
					{
						if (!this.selection.block())
						{
							document.execCommand('formatblock', false, 'p');
						}

						return;
					}

					// clear span
					$insertedList.find('span').replaceWith(function()
					{
						return $(this).contents();
					});

					// remove style
					$insertedList.find(this.opts.inlineTags.join(',')).each(function()
					{
						$(this).removeAttr('style');
					});

					// remove block-element list wrapper
					var $listParent = $insertedList.parent();
					if (this.utils.isRedactorParent($listParent) && $listParent[0].tagName !== 'LI' && this.utils.isBlock($listParent))
					{
						this.selection.save();

						$listParent.replaceWith($listParent.contents());

						this.selection.restore();
					}

				},
				get: function()
				{
					var current = this.selection.current();
					var $list = $(current).closest('ul, ol', this.core.editor()[0]);

					return ($list.length === 0) ? false : $list;
				}
			};
		},

		// =modal
		modal: function()
		{
			return {
				callbacks: {},
				templates: function()
				{
					this.opts.modal = {
						'image-edit': String()
						+ '<div class="modal-section" id="redactor-modal-image-edit">'
							+ '<label>' + this.lang.get('title') + '</label>'
							+ '<input type="text" id="redactor-image-title" />'
							+ '<label class="redactor-image-link-option">' + this.lang.get('link') + '</label>'
							+ '<input type="text" id="redactor-image-link" class="redactor-image-link-option" aria-label="' + this.lang.get('link') + '" />'
							+ '<label class="redactor-image-link-option"><input type="checkbox" id="redactor-image-link-blank" aria-label="' + this.lang.get('link-in-new-tab') + '"> ' + this.lang.get('link-in-new-tab') + '</label>'
						+ '</div>',

						'image': String()
						+ '<div class="modal-section" id="redactor-modal-image-insert">'
							+ '<div id="redactor-modal-image-droparea"></div>'
 						+ '</div>',

						'file': String()
						+ '<div class="modal-section" id="redactor-modal-file-insert">'
							+ '<div id="redactor-modal-file-upload-box">'
								+ '<label>' + this.lang.get('filename') + ' <span class="desc">(' + this.lang.get('optional') + ')</span></label>'
								+ '<input type="text" id="redactor-filename" aria-label="' + this.lang.get('filename') + '" /><br><br>'
								+ '<div id="redactor-modal-file-upload"></div>'
							+ '</div>'
						+ '</div>',

						'link': String()
						+ '<div class="modal-section" id="redactor-modal-link-insert">'
							+ '<label>URL</label>'
							+ '<input type="url" id="redactor-link-url" aria-label="URL" />'
							+ '<label>' + this.lang.get('text') + '</label>'
							+ '<input type="text" id="redactor-link-url-text" aria-label="' + this.lang.get('text') + '" />'
							+ '<label><input type="checkbox" id="redactor-link-blank"> ' + this.lang.get('link-in-new-tab') + '</label>'
						+ '</div>'
					};


					$.extend(this.opts, this.opts.modal);

				},
				addCallback: function(name, callback)
				{
					this.modal.callbacks[name] = callback;
				},
				createTabber: function($modal)
				{
					this.modal.$tabber = $('<div>').attr('id', 'redactor-modal-tabber');

					$modal.prepend(this.modal.$tabber);
				},
				addTab: function(id, name, active)
				{
					var $tab = $('<a href="#" rel="tab' + id + '">').text(name);
					if (active)
					{
						$tab.addClass('active');
					}

					var self = this;
					$tab.on('click', function(e)
					{
						e.preventDefault();
						$('.redactor-tab').hide();
						$('.redactor-' + $(this).attr('rel')).show();

						self.modal.$tabber.find('a').removeClass('active');
						$(this).addClass('active');

					});

					this.modal.$tabber.append($tab);
				},
				addTemplate: function(name, template)
				{
					this.opts.modal[name] = template;
				},
				getTemplate: function(name)
				{
					return this.opts.modal[name];
				},
				getModal: function()
				{
					return this.$modalBody.find('.modal-section');
				},
				load: function(templateName, title, width)
				{
					this.modal.templateName = templateName;
					this.modal.width = width;

					this.modal.build();
					this.modal.enableEvents();
					this.modal.setTitle(title);
					this.modal.setDraggable();
					this.modal.setContent();

					// callbacks
					if (typeof this.modal.callbacks[templateName] !== 'undefined')
					{
						this.modal.callbacks[templateName].call(this);
					}

				},
				show: function()
				{
					this.selection.save();

					if (this.utils.isMobile())
					{
						this.modal.showOnMobile();
					}
					else
					{
						this.modal.showOnDesktop();
					}

					this.$modalOverlay.show();
					this.$modalBox.fadeIn(150);

					this.$modal.attr('tabindex', '-1');
					this.$modal.focus();

					this.modal.setButtonsWidth();

					// resize
					if (!this.utils.isMobile())
					{
						setTimeout($.proxy(this.modal.showOnDesktop, this), 0);
						$(window).on('resize.redactor-modal', $.proxy(this.modal.resize, this));
					}

					// modal shown callback
					this.core.callback('modalOpened', this.modal.templateName, this.$modal);

					// fix bootstrap modal focus
					$(document).off('focusin.modal');

					// enter
					this.$modal.find('input[type=text],input[type=url],input[type=email]').on('keydown.redactor-modal', $.proxy(this.modal.setEnter, this));
				},
				showOnDesktop: function()
				{
					var height = this.$modal.outerHeight();
					var windowHeight = $(window).height();
					var windowWidth = $(window).width();

					if (this.modal.width > windowWidth)
					{
						this.$modal.css({
							width: '96%',
							marginTop: (windowHeight/2 - height/2) + 'px'
						});

						this.utils.saveScroll();
						return;
					}

					if (height > windowHeight)
					{
						this.$modal.css({
							width: this.modal.width + 'px',
							marginTop: '20px'
						});
					}
					else
					{
						this.$modal.css({
							width: this.modal.width + 'px',
							marginTop: (windowHeight/2 - height/2) + 'px'
						});
					}

					this.utils.saveScroll();
					this.utils.disableBodyScroll();

				},
				showOnMobile: function()
				{
					this.$modal.css({
						width: '96%',
						marginTop: '2%'
					});


					this.utils.saveScroll();
				},
				resize: function()
				{
					if (this.utils.isMobile())
					{
						this.modal.showOnMobile();
					}
					else
					{
						this.modal.showOnDesktop();
					}
				},
				setTitle: function(title)
				{
					this.$modalHeader.html(title);
				},
				setContent: function()
				{
					this.$modalBody.html(this.modal.getTemplate(this.modal.templateName));
				},
				setDraggable: function()
				{
					if (typeof $.fn.draggable === 'undefined')
					{
						return;
					}

					this.$modal.draggable({ handle: this.$modalHeader });
					this.$modalHeader.css('cursor', 'move');
				},
				setEnter: function(e)
				{
					if (e.which !== 13)
					{
						return;
					}

					e.preventDefault();
					this.$modal.find('button.redactor-modal-action-btn').click();
				},
				createCancelButton: function()
				{
					var button = $('<button>').addClass('redactor-modal-btn redactor-modal-close-btn').html(this.lang.get('cancel'));
					button.on('click', $.proxy(this.modal.close, this));

					this.$modalFooter.append(button);
				},
				createDeleteButton: function(label)
				{
					return this.modal.createButton(label, 'delete');
				},
				createActionButton: function(label)
				{
					return this.modal.createButton(label, 'action');
				},
				createButton: function(label, className)
				{
					var button = $('<button>').addClass('redactor-modal-btn').addClass('redactor-modal-' + className + '-btn').html(label);
					this.$modalFooter.append(button);

					return button;
				},
				setButtonsWidth: function()
				{
					var buttons = this.$modalFooter.find('button');
					var buttonsSize = buttons.length;
					if (buttonsSize === 0)
					{
						return;
					}

					buttons.css('width', (100/buttonsSize) + '%');
				},
				build: function()
				{
					this.modal.buildOverlay();

					this.$modalBox = $('<div id="redactor-modal-box"/>').hide();
					this.$modal = $('<div id="redactor-modal" role="dialog" />');
					this.$modalHeader = $('<header id="redactor-modal-header" tabindex="1" />');
					this.$modalClose = $('<button type="button" id="redactor-modal-close" tabindex="3" aria-label="' + this.lang.get('close') + '" />').html('&times;');
					this.$modalBody = $('<div id="redactor-modal-body" />');
					this.$modalFooter = $('<footer />');

					this.$modal.append(this.$modalHeader);
					this.$modal.append(this.$modalBody);
					this.$modal.append(this.$modalFooter);
					this.$modal.append(this.$modalClose);
					this.$modalBox.append(this.$modal);
					this.$modalBox.appendTo(document.body);
				},
				buildOverlay: function()
				{
					this.$modalOverlay = $('<div id="redactor-modal-overlay">').hide();
					$('body').prepend(this.$modalOverlay);
				},
				enableEvents: function()
				{
					this.$modalClose.on('click.redactor-modal', $.proxy(this.modal.close, this));
					$(document).on('keyup.redactor-modal', $.proxy(this.modal.closeHandler, this));
					this.$editor.on('keyup.redactor-modal', $.proxy(this.modal.closeHandler, this));
					this.$modalBox.on('click.redactor-modal', $.proxy(this.modal.close, this));
				},
				disableEvents: function()
				{
					this.$modalClose.off('click.redactor-modal');
					$(document).off('keyup.redactor-modal');
					this.$editor.off('keyup.redactor-modal');
					this.$modalBox.off('click.redactor-modal');
					$(window).off('resize.redactor-modal');
				},
				closeHandler: function(e)
				{
					if (e.which !== this.keyCode.ESC)
					{
						return;
					}

					this.modal.close(false);
				},
				close: function(e)
				{
					if (e)
					{
						if (!$(e.target).hasClass('redactor-modal-close-btn') && e.target !== this.$modalClose[0] && e.target !== this.$modalBox[0])
						{
							return;
						}

						e.preventDefault();
					}

					if (!this.$modalBox)
					{
						return;
					}

					// restore selection
					this.selection.restore();

					this.modal.disableEvents();
					this.utils.enableBodyScroll();
					this.utils.restoreScroll();

					this.$modalOverlay.fadeOut(500, $.proxy(function()
					{
						this.$modalOverlay.remove();

					}, this));

					this.$modalBox.fadeOut(300, $.proxy(function()
					{
						this.$modalBox.remove();

						$(document.body).css('overflow', this.modal.bodyOveflow);
						this.core.callback('modalClosed', this.modal.templateName);

					}, this));


				}
			};
		},

		// =observe
		observe: function()
		{
			return {
				load: function()
				{
					if (typeof this.opts.destroyed !== 'undefined')
					{
						return;
					}

					// ie pre & code
					if (this.browser.ie())
					{
						var self = this;
						this.core.editor().find('pre, code').on('mouseover',function()
						{
							self.events.stopDetect();
							self.core.editor().attr('contenteditable', false);
							$(this).attr('contenteditable', true);
							self.events.startDetect();

						}).on('mouseout',function()
						{
							self.events.stopDetect();
							self.core.editor().attr('contenteditable', true);
							$(this).removeAttr('contenteditable');
							self.events.startDetect();

						});
					}

					this.observe.images();
					this.observe.links();
				},
				isCurrent: function($el, $current)
				{
					if (typeof $current === 'undefined')
					{
						$current = $(this.selection.current());
					}

					return $current.is($el) || $current.parents($el).length > 0;
				},
				dropdowns: function()
				{
					var $current = $(this.selection.current());
					var isRedactor = this.utils.isRedactorParent($current);

					$.each(this.opts.observe.dropdowns, $.proxy(function(key, value)
					{
						var observe = value.observe,
							element = observe.element,
							$item   = value.item,
							inValues = typeof observe.in !== 'undefined' ? observe.in : false,
							outValues = typeof observe.out !== 'undefined' ? observe.out : false;

						if ($current.closest(element).size() > 0 && isRedactor)
						{
							this.observe.setDropdownProperties($item, inValues, outValues);
						}
						else
						{
							this.observe.setDropdownProperties($item, outValues, inValues);
						}

					}, this));
				},
				setDropdownProperties: function($item, addProperties, deleteProperties)
				{
					if (deleteProperties && typeof deleteProperties.attr !== 'undefined')
					{
						this.observe.setDropdownAttr($item, deleteProperties.attr, true);
					}

					if (typeof addProperties.attr !== 'undefined')
					{
						this.observe.setDropdownAttr($item, addProperties.attr);
					}

					if (typeof addProperties.title !== 'undefined')
					{
						$item.text(addProperties.title);
					}
				},
				setDropdownAttr: function($item, properties, isDelete)
				{
					$.each(properties, function(key, value)
					{
						if (key === 'class')
						{
							if (!isDelete)
							{
								$item.addClass(value);
							}
							else
							{
								$item.removeClass(value);
							}
						}
						else
						{
							if (!isDelete)
							{
								$item.attr(key, value);
							}
							else
							{
								$item.removeAttr(key);
							}
						}
					});
				},
				addDropdown: function($item, btnName, btnObject)
				{
					if (typeof btnObject.observe === "undefined")
					{
						return;
					}

					btnObject.item = $item;

					this.opts.observe.dropdowns.push(btnObject);
				},
				images: function()
				{
					this.core.editor().find('img').each($.proxy(function(i, img)
					{
						var $img = $(img);

						// IE fix (when we clicked on an image and then press backspace IE does goes to image's url)
						$img.closest('a', this.$editor[0]).on('click', function(e) { e.preventDefault(); });

						if (this.browser.ie())
						{
							$img.attr('unselectable', 'on');
						}

						this.image.setEditable($img);

					}, this));

				},
				links: function()
				{
					if (!this.opts.linkTooltip)
					{
						return;
					}

					this.core.editor().find('a').on('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid, $.proxy(this.observe.showTooltip, this));
					this.core.editor().on('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid, $.proxy(this.observe.closeTooltip, this));
					$(document).on('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid, $.proxy(this.observe.closeTooltip, this));
				},
				getTooltipPosition: function($link)
				{
					return $link.offset();
				},
				showTooltip: function(e)
				{
					var $el = $(e.target);

					if ($el[0].tagName === 'IMG')
					{
						return;
					}

					if ($el[0].tagName !== 'A')
					{
						$el = $el.closest('a', this.$editor[0]);
					}

					if ($el[0].tagName !== 'A')
					{
						return;
					}

					var $link = $el;

					var pos = this.observe.getTooltipPosition($link);
					var tooltip = $('<span class="redactor-link-tooltip"></span>');

					var href = $link.attr('href');
					if (href === undefined)
					{
						href = '';
					}

					if (href.length > 24)
					{
						href = href.substring(0, 24) + '...';
					}

					var aLink = $('<a href="' + $link.attr('href') + '" target="_blank" />').html(href).addClass('redactor-link-tooltip-action');
					var aEdit = $('<a href="#" />').html(this.lang.get('edit')).on('click', $.proxy(this.link.show, this)).addClass('redactor-link-tooltip-action');
					var aUnlink = $('<a href="#" />').html(this.lang.get('unlink')).on('click', $.proxy(this.link.unlink, this)).addClass('redactor-link-tooltip-action');

					tooltip.append(aLink).append(' | ').append(aEdit).append(' | ').append(aUnlink);
					tooltip.css({
						top: (pos.top + parseInt($link.css('line-height'), 10)) + 'px',
						left: pos.left + 'px'
					});

					$('.redactor-link-tooltip').remove();
					$('body').append(tooltip);
				},
				closeTooltip: function(e)
				{
					e = e.originalEvent || e;

					var target = e.target;
					var $parent = $(target).closest('a', this.$editor[0]);
					if ($parent.length !== 0 && $parent[0].tagName === 'A' && target.tagName !== 'A')
					{
						return;
					}
					else if ((target.tagName === 'A' && this.utils.isRedactorParent(target)) || $(target).hasClass('redactor-link-tooltip-action'))
					{
						return;
					}

					$('.redactor-link-tooltip').remove();
				}

			};
		},

		// =paragraphize
		paragraphize: function()
		{
			return {
				load: function(html)
				{
					if (this.opts.paragraphize === false || this.opts.type === 'inline' || this.opts.type === 'pre')
					{
						return html;
					}

					if (html === '' || html === '<p></p>')
					{
						return this.opts.emptyHtml;
					}

					html = html + "\n";

					this.paragraphize.safes = [];
					this.paragraphize.z = 0;

					html = html.replace(/(<br\s?\/?>){1,}\n?<\/blockquote>/gi, '</blockquote>');

					html = this.paragraphize.getSafes(html);
					html = this.paragraphize.convert(html);
					html = this.paragraphize.clear(html);
					html = this.paragraphize.restoreSafes(html);

					html = html.replace(new RegExp('<br\\s?/?>\n?<(' + this.opts.paragraphizeBlocks.join('|') + ')(.*?[^>])>', 'gi'), '<p><br /></p>\n<$1$2>');

					return $.trim(html);
				},
				getSafes: function(html)
				{
					var $div = $('<div />').append(html);

					// remove paragraphs in blockquotes
					$div.find('blockquote p').replaceWith(function()
					{
						return $(this).append('<br />').contents();
					});

					html = $div.html();

					$div.find(this.opts.paragraphizeBlocks.join(', ')).each($.proxy(function(i,s)
					{
						this.paragraphize.z++;
						this.paragraphize.safes[this.paragraphize.z] = s.outerHTML;
						html = html.replace(s.outerHTML, '\n{replace' + this.paragraphize.z + '}\n');

					}, this));

					return html;
				},
				restoreSafes: function(html)
				{
					$.each(this.paragraphize.safes, function(i,s)
					{
						s = (typeof s !== 'undefined') ? s.replace(/\$/g, '&#36;') : s;
						html = html.replace('{replace' + i + '}', s);

					});

					return html;
				},
				convert: function(html)
				{
					html = html.replace(/\r\n/g, "xparagraphmarkerz");
					html = html.replace(/\n/g, "xparagraphmarkerz");
					html = html.replace(/\r/g, "xparagraphmarkerz");

					var re1 = /\s+/g;
					html = html.replace(re1, " ");
					html = $.trim(html);

					var re2 = /xparagraphmarkerzxparagraphmarkerz/gi;
					html = html.replace(re2, "</p><p>");

					var re3 = /xparagraphmarkerz/gi;
					html = html.replace(re3, "<br>");

					html = '<p>' + html + '</p>';


					html = html.replace("<p></p>", "");
					html = html.replace("\r\n\r\n", "");
					html = html.replace(/<\/p><p>/g, "</p>\r\n\r\n<p>");
					html = html.replace(new RegExp("<p><br />", "g"), "<p>");
					html = html.replace(new RegExp("<p><br>", "g"), "<p>");
					html = html.replace(new RegExp("<br></p>", "g"), "</p>");
					html = html.replace(/<p>&nbsp;<\/p>/gi, "");

					return html;
				},
				clear: function(html)
				{
					html = html.replace(/<p>(.*?){replace(.*?)\}\s?<\/p>/gi, '{replace$2}');

					html = html.replace(new RegExp('</blockquote></p>', 'gi'), '</blockquote>');
					html = html.replace(new RegExp('<p></blockquote>', 'gi'), '</blockquote>');
					html = html.replace(new RegExp('<p><blockquote>', 'gi'), '<blockquote>');
					html = html.replace(new RegExp('<blockquote></p>', 'gi'), '<blockquote>');

					html = html.replace(new RegExp('<p><p ', 'gi'), '<p ');
					html = html.replace(new RegExp('<p><p>', 'gi'), '<p>');
					html = html.replace(new RegExp('</p></p>', 'gi'), '</p>');
					html = html.replace(new RegExp('<p>\\s?</p>', 'gi'), '');
					html = html.replace(new RegExp("\n</p>", 'gi'), '</p>');
					html = html.replace(new RegExp('<p>\t?\t?\n?<p>', 'gi'), '<p>');
					html = html.replace(new RegExp('<p>\t*</p>', 'gi'), '');

					return html;
				}
			};
		},

		// =paste
		paste: function()
		{
			return {
				init: function(e)
				{
					this.rtePaste = true;

					e.preventDefault();

					var data = ((e.originalEvent || e).clipboardData || window.clipboardData);

					// get text
					var html = data.getData('text/html') || data.getData('text');
					var pre = false;
					if (this.opts.type !== 'pre' && !this.utils.isCurrentOrParent('pre'))
					{
						// save links
						html = html.replace(/<a(.*?)href="(.*?)"(.*?[^>])>(.*?)<\/a>/gi, '###a href="$2"###$4###/a###');

						html = html.replace(/<!--[\s\S]*?-->/gi, '');
						html = html.replace(/<style[\s\S]*?style>/gi, '');
						html = html.replace(/<br\s?\/?>|<\/p>|<\/div>|<\/li>|<\/td>/gi, '\n');
						html = html.replace(/<\/H[1-6]>/gi, '\n\n');

						var tmp = document.createElement('div');
						tmp.innerHTML = html;
						html = $.trim(tmp.textContent || tmp.innerText);
					}
					else
					{
						pre = true;

						// pre clean
						html = html.replace(/^<meta charset='(.*?)'>/i, '');

						if (html.match(/^<pre style="(.*?)">/i))
						{
							html = html.replace(/^<pre style="(.*?)">/i, '');
							html = html.replace(/<\/pre>$/i, '');
						}

					}

					// clean
					html = this.clean.onPaste(html);

					// revert links
					html = html.replace(/###a href="(.*?)"###(.*?)###\/a###/gi, '<a href="$1">$2</a>');

					// callback
					var returned = this.core.callback('paste', html);
					html = (typeof returned === 'undefined') ? html : returned;

					// buffer
					this.buffer.set();

					// insert
					if (this.paste.text)
					{
						this.insert.text(html);
					}
					else
					{
						this.insert.raw(html);
					}

					this.rtePaste = false;

					// clean pre empty paragraph at the end
					if (pre)
					{
						var block = $(this.selection.block()).closest('pre', this.core.editor()[0]);
						$(block).find('p').remove();
					}

				}
			};
		},

		// =placeholder
		placeholder: function()
		{
			return {
				enable: function()
				{
					if (!this.placeholder.is())
					{
						return;
					}

					var position = this.core.editor().css('position');
					var arr = ['absolute', 'fixed', 'relative'];
					if ($.inArray(arr, position) === -1)
					{
						this.core.editor().addClass('redactor-relative');
					}

					var top = this.core.editor().css('padding-top');
					var left = this.core.editor().css('padding-left');
					$('<style class="redactor-style-tag">#' + this.core.id() + '.redactor-placeholder::after{ top: ' + top + '; left: ' + left + '; }</style>').appendTo('head');

					this.core.editor().attr('placeholder', this.$element.attr('placeholder'));

					this.placeholder.toggle();
					this.core.editor().on('keydown.redactor-placeholder', $.proxy(this.placeholder.toggle, this));
				},
				toggle: function()
				{
					setTimeout($.proxy(function()
					{
						var func = this.utils.isEmpty() ? 'addClass' : 'removeClass';
						this.core.editor()[func]('redactor-placeholder');

					}, this), 5);
				},
				remove: function()
				{
					this.core.editor().removeClass('redactor-placeholder');
				},
				is: function()
				{
					if (this.opts.placeholder)
					{
						return this.$element.attr('placeholder', this.opts.placeholder);
					}
					else
					{
						return !(typeof this.$element.attr('placeholder') === 'undefined' || this.$element.attr('placeholder') === '');
					}
				}
			};
		},

		// =progress
		progress: function()
		{
			return {
				show: function()
				{
					$(document.body).append($('<div id="redactor-progress"><span></span></div>'));
					$('#redactor-progress').fadeIn();
				},
				hide: function()
				{
					$('#redactor-progress').fadeOut(1500, function()
					{
						$(this).remove();
					});
				}

			};
		},

		// =selection
		selection: function()
		{
			return {
				get: function()
				{
					if (window.getSelection)
					{
						return window.getSelection();
					}
					else if (document.selection && document.selection.type !== "Control")
					{
						return document.selection;
					}

					return null;
				},
				range: function(sel)
				{
					if (typeof sel === 'undefined')
					{
						sel = this.selection.get();
					}

					if (sel.getRangeAt && sel.rangeCount)
					{
						return sel.getRangeAt(0);
					}

					return null;
				},
				update: function(sel, range)
				{
					if (range === null)
					{
						return;
					}

					sel.removeAllRanges();
					sel.addRange(range);
				},
				current: function()
				{
					var sel = this.selection.get();

					return (sel === null) ? false : sel.anchorNode;
				},
				parent: function()
				{
					var current = this.selection.current();

					return (current === null) ? false : current.parentNode;
				},
				block: function(node)
				{
					node = node || this.selection.current();

					while (node)
					{
						if (this.utils.isBlockTag(node.tagName))
						{
							return ($(node).hasClass('redactor-in')) ? false : node;
						}

						node = node.parentNode;
					}

					return false;
				},
				inline: function(node)
				{
					node = node || this.selection.current();

					while (node)
					{
						if (this.utils.isInlineTag(node.tagName))
						{
							return ($(node).hasClass('redactor-in')) ? false : node;
						}

						node = node.parentNode;
					}

					return false;
				},
				element: function(node)
				{
					if (!node)
					{
						node = this.selection.current();
					}

					while (node)
					{
						if (node.nodeType === 1)
						{
							if ($(node).hasClass('redactor-in'))
							{
								return false;
							}

							return node;
						}

						node = node.parentNode;
					}

					return false;
				},
				prev: function()
				{
					var current = this.selection.current();

					return (current === null) ? false : this.selection.current().previousSibling;
				},
				next: function()
				{
					var current = this.selection.current();

					return (current === null) ? false : this.selection.current().nextSibling;
				},
				blocks: function()
				{
					var blocks = [];
					var nodes = this.selection.nodes();

					$.each(nodes, $.proxy(function(i,node)
					{
						if (this.utils.isBlock(node))
						{
							blocks.push(node);
						}

					}, this));

					return (blocks.length === 0) ? [this.selection.block()] : blocks;
				},
				inlines: function()
				{
					var inlines = [];
					var nodes = this.selection.nodes();

					$.each(nodes, $.proxy(function(i,node)
					{
						if (this.utils.isInline(node))
						{
							inlines.push(node);
						}

					}, this));

					return (inlines.length === 0) ? [this.selection.inline()] : inlines;
				},
				nodes: function()
				{
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					if (this.utils.isCollapsed())
					{
						return [this.selection.current()];
					}
					else
					{
						var node = range.startContainer;
						var endNode = range.endContainer;

						// single node
						if (node === endNode)
						{
							return [node];
						}

						// iterate
						var nodes = [];
						while (node && node !== endNode)
						{
							nodes.push(node = this.selection.nextNode(node));
						}

						// partially selected nodes
						node = range.startContainer;
						while (node && node !== range.commonAncestorContainer)
						{
							nodes.unshift(node);
							node = node.parentNode;
						}

						// remove service nodes
						var resultNodes = [];
						$.each(nodes, function(i,s)
						{
							if (!$(s).hasClass('redactor-script-tag, redactor-selection-marker'))
							{
								resultNodes.push(s);
							}
						});

						return (resultNodes.length === 0) ? [false] : resultNodes;
					}

				},
				nextNode: function(node)
				{
					if (node.hasChildNodes())
					{
						return node.firstChild;
					}
					else
					{
						while (node && !node.nextSibling)
						{
							node = node.parentNode;
						}

						if (!node)
						{
							return null;
						}

						return node.nextSibling;
					}
				},
				save: function()
				{
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					var node1 = this.selection.marker(1);

					this.insert.marker(range, node1, true);
					if (range && range.collapsed === false)
					{
						var node2 = this.selection.marker(2);
						this.insert.marker(range, node2, false);
					}

					this.savedSel = this.core.editor().html();
				},
				restore: function(removeMarkers)
				{
					var node1 = this.core.editor().find('span#selection-marker-1');
					var node2 = this.core.editor().find('span#selection-marker-2');

					if (this.browser.ff())
					{
						this.core.editor().focus();
					}

					if (node1.length !== 0 && node2.length !== 0)
					{
						this.caret.set(node1, node2);
					}
					else if (node1.length !== 0)
					{
						this.caret.start(node1);
					}
					else
					{
						this.core.editor().focus();
					}

					if (removeMarkers !== false)
					{
						this.selection.removeMarkers();
						this.savedSel = false;
					}

				},
				removeMarkers: function()
				{
					this.core.editor().find('.redactor-selection-marker').each(function(i,s)
					{
						var text = $(s).text().replace(/\u200B/g, '');
						if (text === '')
						{
							$(s).remove();
						}
						else
						{
							$(s).replaceWith(function() { return $(this).contents(); });
						}
					});
				},
				marker: function(num)
				{
					if (typeof num === 'undefined')
					{
						num = 1;
					}

					return $('<span id="selection-marker-' + num + '" class="redactor-selection-marker"  data-verified="redactor">' + this.opts.invisibleSpace + '</span>')[0];
				},
				markerHtml: function(num)
				{
					return this.utils.getOuterHtml(this.selection.marker(num));
				},
				node: function(node)
				{
					$(node).prepend(this.selection.marker(1));
					$(node).append(this.selection.marker(2));

					this.selection.restore();
				},
				all: function()
				{
					this.core.editor().focus();

					var sel = this.selection.get();
					var range = this.selection.range(sel);

					range.selectNodeContents(this.core.editor()[0]);

					this.selection.update(sel, range);
				},
				remove: function()
				{
					this.selection.get().removeAllRanges();
				},
				replace: function(html)
				{
					this.insert.html(html);
				},
				text: function()
				{
					return this.selection.get().toString();
				},
				html: function()
				{
					var html = '';
					var sel = this.selection.get();

					if (sel.rangeCount)
					{
						var container = document.createElement('div');
						var len = sel.rangeCount;
						for (var i = 0; i < len; ++i)
						{
							container.appendChild(sel.getRangeAt(i).cloneContents());
						}

						html = this.clean.onGet(container.innerHTML);
					}

					return html;
				}

			};
		},

		// =shortcuts
		shortcuts: function()
		{
			return {
				init: function(e, key)
				{
					// disable browser's hot keys for bold and italic
					if (!this.opts.shortcuts)
					{
						if ((e.ctrlKey || e.metaKey) && (key === 66 || key === 73))
						{
							e.preventDefault();
						}

						return false;
					}


					$.each(this.opts.shortcuts, $.proxy(function(str, command)
					{
						var keys = str.split(',');
						var len = keys.length;
						var handler = $.proxy(function()
						{
							var func;
							if (command.func.search(/\./) !== '-1')
							{
								func = command.func.split('.');
								if (typeof this[func[0]] !== 'undefined')
								{
									this[func[0]][func[1]].apply(this, command.params);
								}
							}
							else
							{
								this[command.func].apply(this, command.params);
							}

						}, this);

						for (var i = 0; i < len; i++)
						{
							if (typeof keys[i] === 'string')
							{
								this.shortcuts.handler(e, $.trim(keys[i]), handler);
							}

						}

					}, this));
				},
				handler: function(e, keys, origHandler)
				{
					// based on https://github.com/jeresig/jquery.hotkeys
					var hotkeysSpecialKeys =
					{
						8: "backspace", 9: "tab", 10: "return", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
						20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
						37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 59: ";", 61: "=",
						96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
						104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
						112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
						120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 173: "-", 186: ";", 187: "=",
						188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'"
					};


					var hotkeysShiftNums =
					{
						"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
						"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
						".": ">",  "/": "?",  "\\": "|"
					};

					keys = keys.toLowerCase().split(" ");
					var special = hotkeysSpecialKeys[e.keyCode],
						character = String.fromCharCode( e.which ).toLowerCase(),
						modif = "", possible = {};

					$.each([ "alt", "ctrl", "meta", "shift"], function(index, specialKey)
					{
						if (e[specialKey + 'Key'] && special !== specialKey)
						{
							modif += specialKey + '+';
						}
					});


					if (special)
					{
						possible[modif + special] = true;
					}

					if (character)
					{
						possible[modif + character] = true;
						possible[modif + hotkeysShiftNums[character]] = true;

						// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
						if (modif === "shift+")
						{
							possible[hotkeysShiftNums[character]] = true;
						}
					}

					for (var i = 0, len = keys.length; i < len; i++)
					{
						if (possible[keys[i]])
						{
							e.preventDefault();
							return origHandler.apply(this, arguments);
						}
					}
				}
			};
		},

		// =toolbar
		toolbar: function()
		{
			return {
				custom: function()
				{
					$(document).find('[data-cmd]').each($.proxy(function(i,s)
					{
						var $el = $(s);
						var func = $el.data('cmd');
						var args = $el.data('args');

						$el.addClass('redactor-data-cmd');
						$el.on('click.redactor-data-cmd', $.proxy(function(e)
						{
							e.preventDefault();

							if (func === 'func')
							{
								var fn = window[args];
								if (typeof fn === 'function')
								{
									fn.call(this, $el, e);
								}
							}
							else
							{
								var cmd = func.split('.');
								if (typeof this[cmd[0]] !== 'undefined')
								{
									if (!$.isArray(args))
									{
										args = (args) ? args.split('|') : undefined;
									}

									this[cmd[0]][cmd[1]].apply(this, args);
								}

							}

						}, this));


					}, this));
				},
				build: function()
				{
					this.button.hideButtons();
					this.button.hideButtonsOnMobile();

					if (this.opts.buttons.length === 0)
					{
						return;
					}

					this.$toolbar = this.toolbar.createContainer();

					this.toolbar.setOverflow();
					this.toolbar.append();
					this.button.$toolbar = this.$toolbar;
					this.button.setFormatting();
					this.button.load(this.$toolbar);
					this.toolbar.setFixed();
				},
				createContainer: function()
				{
					return $('<ul>').addClass('redactor-toolbar').attr({ 'id': 'redactor-toolbar-' + this.uuid, 'role': 'toolbar' });
				},
				append: function()
				{
					if (this.opts.toolbarExternal)
					{
						this.$toolbar.addClass('redactor-toolbar-external');
						$(this.opts.toolbarExternal).html(this.$toolbar);
					}
					else
					{
						if (this.opts.type === 'textarea')
						{
							this.$box.prepend(this.$toolbar);
						}
						else
						{
							this.$element.before(this.$toolbar);
						}

					}
				},
				setOverflow: function()
				{
					if (this.utils.isMobile() || this.opts.toolbarOverflow)
					{
						this.$toolbar.addClass('redactor-toolbar-overflow');
					}
				},
				setFixed: function()
				{
					if (!this.utils.isDesktop() || !this.opts.toolbarFixed || this.opts.toolbarExternal)
					{
						return;
					}

					if (this.opts.toolbarFixedTarget !== document)
					{
						var $el = $(this.opts.toolbarFixedTarget);
						this.toolbarOffsetTop = ($el.length === 0) ? 0 : this.core.box().offset().top - $el.offset().top;
					}

					// bootstrap modal fix
					var late = (this.core.box().closest('.modal-body').length !== 0) ? 1000 : 0;

					setTimeout($.proxy(function()
					{
						this.toolbar.observeScroll();
						$(this.opts.toolbarFixedTarget).on('scroll.redactor.' + this.uuid, $.proxy(this.toolbar.observeScroll, this));

					}, this), late);


				},
				getBoxTop: function()
				{
					return (this.opts.toolbarFixedTarget === document) ? this.core.box().offset().top : this.toolbarOffsetTop;
				},
				observeScroll: function()
				{

					var tolerance = (this.opts.toolbarFixedTarget === document) ? 20 : 0;
					var scrollTop = $(this.opts.toolbarFixedTarget).scrollTop();
					var boxTop = this.toolbar.getBoxTop();

					if ((scrollTop + this.opts.toolbarFixedTopOffset + tolerance) > boxTop)
					{
						this.toolbar.observeScrollEnable(scrollTop, boxTop);
					}
					else
					{
						this.toolbar.observeScrollDisable();
					}
				},
				observeScrollResize: function()
				{
					this.$toolbar.css({

						width: this.core.box().innerWidth(),
						left: this.core.box().offset().left

					});
				},
				observeScrollEnable: function(scrollTop, boxTop)
				{
					if (typeof this.fullscreen !== 'undefined' && this.fullscreen.isOpened === false)
					{
						this.toolbar.observeScrollDisable();
						return;
					}

					var end = boxTop + this.core.box().outerHeight() - 32;
					var width = this.core.box().innerWidth();
					var position = 'fixed';
					var top = this.opts.toolbarFixedTopOffset;
					var left = this.core.box().offset().left;

					if (this.opts.toolbarFixedTarget !== document)
					{
						 position = 'absolute';
						 top = this.opts.toolbarFixedTopOffset + $(this.opts.toolbarFixedTarget).scrollTop() - boxTop - 1;
						 left = 0;
					}

					this.$toolbar.addClass('toolbar-fixed-box');
					this.$toolbar.css({
						position: position,
						width: width,
						top: top,
						left: left
					});

					if (scrollTop > end)
					{
						$('.redactor-dropdown-' + this.uuid + ':visible').hide();
					}

					this.toolbar.setDropdownsFixed();
					this.$toolbar.css('visibility', (scrollTop < end) ? 'visible' : 'hidden');
					$(window).on('resize.redactor-toolbar.' + this.uuid, $.proxy(this.toolbar.observeScrollResize, this));
				},
				observeScrollDisable: function()
				{
					this.$toolbar.css({
						position: 'relative',
						width: 'auto',
						top: '-1px',
						left: 0,
						visibility: 'visible'
					});

					this.toolbar.unsetDropdownsFixed();
					this.$toolbar.removeClass('toolbar-fixed-box');
					$(window).off('resize.redactor-toolbar.' + this.uuid);
				},
				setDropdownsFixed: function()
				{
					var position = (this.opts.toolbarFixedTarget === document) ? 'fixed' : 'absolute';
					this.toolbar.setDropdownPosition(position);
				},
				unsetDropdownsFixed: function()
				{
					this.toolbar.setDropdownPosition('absolute');
				},
				setDropdownPosition: function(position)
				{
					var self = this;
					$('.redactor-dropdown-' + this.uuid).each(function()
					{
						var $el = $(this);
						var $button = self.button.get($el.attr('rel'));
						var top = (position === 'fixed') ? self.opts.toolbarFixedTopOffset : $button.offset().top;

						$el.css({ position: position, top: ($button.innerHeight() + top) + 'px' });
					});
				}
			};
		},

		// =upload
		upload: function()
		{
			return {
				init: function(id, url, callback)
				{
					this.upload.direct = false;
					this.upload.callback = callback;
					this.upload.url = url;
					this.upload.$el = $(id);
					this.upload.$droparea = $('<div id="redactor-droparea" />');

					this.upload.$placeholdler = $('<div id="redactor-droparea-placeholder" />').text(this.lang.get('upload-label'));
					this.upload.$input = $('<input type="file" name="file" />');

					this.upload.$placeholdler.append(this.upload.$input);
					this.upload.$droparea.append(this.upload.$placeholdler);
					this.upload.$el.append(this.upload.$droparea);

					this.upload.$droparea.off('redactor.upload');
					this.upload.$input.off('redactor.upload');

					this.upload.$droparea.on('dragover.redactor.upload', $.proxy(this.upload.onDrag, this));
					this.upload.$droparea.on('dragleave.redactor.upload', $.proxy(this.upload.onDragLeave, this));

					// change
					this.upload.$input.on('change.redactor.upload', $.proxy(function(e)
					{
						e = e.originalEvent || e;
						this.upload.traverseFile(this.upload.$input[0].files[0], e);
					}, this));

					// drop
					this.upload.$droparea.on('drop.redactor.upload', $.proxy(function(e)
					{
						e.preventDefault();

						this.upload.$droparea.removeClass('drag-hover').addClass('drag-drop');
						this.upload.onDrop(e);

					}, this));
				},
				directUpload: function(file, e)
				{
					this.upload.direct = true;
					this.upload.traverseFile(file, e);
				},
				onDrop: function(e)
				{
					e = e.originalEvent || e;
					var files = e.dataTransfer.files;

					this.upload.traverseFile(files[0], e);
				},
				traverseFile: function(file, e)
				{
					if (this.opts.s3)
					{
						this.upload.setConfig(file);
						this.uploads3.send(file);
						return;
					}

					var formData = !!window.FormData ? new FormData() : null;
					if (window.FormData)
					{
						this.upload.setConfig(file);

						var name = (this.upload.type === 'image') ? this.opts.imageUploadParam : this.opts.fileUploadParam;
						formData.append(name, file);
					}

					this.progress.show();
					this.core.callback('uploadStart', e, formData);
					this.upload.send(formData, e);
				},
				setConfig: function(file)
				{
					this.upload.getType(file);

					if (this.upload.direct)
					{
						this.upload.url = (this.upload.type === 'image') ? this.opts.imageUpload : this.opts.fileUpload;
						this.upload.callback = (this.upload.type === 'image') ? this.image.insert : this.file.insert;
					}
				},
				getType: function(file)
				{
					this.upload.type = (this.opts.imageTypes.indexOf(file.type) === -1) ? 'file' : 'image';
				},
				getHiddenFields: function(obj, fd)
				{
					if (obj === false || typeof obj !== 'object')
					{
						return fd;
					}

					$.each(obj, $.proxy(function(k, v)
					{
						if (v !== null && v.toString().indexOf('#') === 0)
						{
							v = $(v).val();
						}

						fd.append(k, v);

					}, this));

					return fd;

				},
				send: function(formData, e)
				{
					// append hidden fields
					if (this.upload.type === 'image')
					{
						formData = this.upload.getHiddenFields(this.opts.uploadImageFields, formData);
						formData = this.upload.getHiddenFields(this.upload.imageFields, formData);
					}
					else
					{
						formData = this.upload.getHiddenFields(this.opts.uploadFileFields, formData);
						formData = this.upload.getHiddenFields(this.upload.fileFields, formData);
					}

					var xhr = new XMLHttpRequest();
					xhr.open('POST', this.upload.url);
					xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

					// complete
					xhr.onreadystatechange = $.proxy(function()
					{
					    if (xhr.readyState === 4)
					    {
					        var data = xhr.responseText;

							data = data.replace(/^\[/, '');
							data = data.replace(/\]$/, '');

							var json;
							try
							{
								json = (typeof data === 'string' ? $.parseJSON(data) : data);
							}
							catch(err)
							{
								json = { error: true };
							}


							this.progress.hide();

							if (!this.upload.direct)
							{
								this.upload.$droparea.removeClass('drag-drop');
							}

							this.upload.callback(json, this.upload.direct, e);
					    }
					}, this);


					/*
					xhr.upload.onprogress = $.proxy(function(e)
					{
						if (e.lengthComputable)
						{
							var complete = (e.loaded / e.total * 100 | 0);
							//progress.value = progress.innerHTML = complete;
						}

					}, this);
					*/


					xhr.send(formData);
				},
				onDrag: function(e)
				{
					e.preventDefault();
					this.upload.$droparea.addClass('drag-hover');
				},
				onDragLeave: function(e)
				{
					e.preventDefault();
					this.upload.$droparea.removeClass('drag-hover');
				},
				clearImageFields: function()
				{
					this.upload.imageFields = {};
				},
				addImageFields: function(name, value)
				{
					this.upload.imageFields[name] = value;
				},
				removeImageFields: function(name)
				{
					delete this.upload.imageFields[name];
				},
				clearFileFields: function()
				{
					this.upload.fileFields = {};
				},
				addFileFields: function(name, value)
				{
					this.upload.fileFields[name] = value;
				},
				removeFileFields: function(name)
				{
					delete this.upload.fileFields[name];
				}
			};
		},

		// =s3
		uploads3: function()
		{
			return {
				send: function(file)
				{
					this.uploads3.executeOnSignedUrl(file, $.proxy(function(signedURL)
					{
						this.uploads3.sendToS3(file, signedURL);
					}, this));
				},
				executeOnSignedUrl: function(file, callback)
				{
					var xhr = new XMLHttpRequest();
					var mark = (this.opts.s3.search(/\?/) !== '-1') ? '?' : '&';


					xhr.open('GET', this.opts.s3 + mark + 'name=' + file.name + '&type=' + file.type, true);

					// Hack to pass bytes through unprocessed.
					if (xhr.overrideMimeType)
					{
						xhr.overrideMimeType('text/plain; charset=x-user-defined');
					}

					var that = this;
					xhr.onreadystatechange = function(e)
					{
						if (this.readyState === 4 && this.status === 200)
						{
							that.progress.show();
							callback(decodeURIComponent(this.responseText));
						}
						else if (this.readyState === 4 && this.status !== 200)
						{
							//setProgress(0, 'Could not contact signing script. Status = ' + this.status);
						}
					};

					xhr.send();
				},
				createCORSRequest: function(method, url)
				{
					var xhr = new XMLHttpRequest();
					if ("withCredentials" in xhr)
					{
						xhr.open(method, url, true);
					}
					else if (typeof XDomainRequest !== "undefined")
					{
						xhr = new XDomainRequest();
						xhr.open(method, url);
					}
					else
					{
						xhr = null;
					}

					return xhr;
				},
				sendToS3: function(file, url)
				{
					var xhr = this.uploads3.createCORSRequest('PUT', url);
					if (!xhr)
					{
						//setProgress(0, 'CORS not supported');
						return;
					}

					xhr.onload = $.proxy(function()
					{
						if (xhr.status !== 200)
						{
							//setProgress(0, 'Upload error: ' + xhr.status);
							return;
						}

						//setProgress(100, 'Upload completed.');

						this.progress.hide();

						var s3file = url.split('?');

						if (!s3file[0])
						{
							 // url parsing is fail
							 return false;
						}


						if (!this.upload.direct)
						{
							this.upload.$droparea.removeClass('drag-drop');
						}

						var json = { filelink: s3file[0] };
						if (this.upload.type === 'file')
						{
							var arr = s3file[0].split('/');
							json.filename = arr[arr.length-1];
						}

						this.upload.callback(json, this.upload.direct, false);


					}, this);

					xhr.onerror = function() {};
					xhr.upload.onprogress = function(e) {};

					xhr.setRequestHeader('Content-Type', file.type);
					xhr.setRequestHeader('x-amz-acl', 'public-read');

					xhr.send(file);

				}
			};
		},

		// =utils
		utils: function()
		{
			return {
				isEmpty: function(html)
				{
					html = (typeof html === 'undefined') ? this.core.editor().html() : html;

					html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');
					html = html.replace(/&nbsp;/gi, '');
					html = html.replace(/<\/?br\s?\/?>/g, '');
					html = html.replace(/\s/g, '');
					html = html.replace(/^<p>[^\W\w\D\d]*?<\/p>$/i, '');
					html = html.replace(/<iframe(.*?[^>])>$/i, 'iframe');
					html = html.replace(/<source(.*?[^>])>$/i, 'source');

					// remove empty tags
					html = html.replace(/<[^\/>][^>]*><\/[^>]+>/gi, '');
					html = html.replace(/<[^\/>][^>]*><\/[^>]+>/gi, '');

					html = $.trim(html);

					return html === '';
				},
				isElement: function(obj)
				{
					try {
						// Using W3 DOM2 (works for FF, Opera and Chrome)
						return obj instanceof HTMLElement;
					}
					catch(e)
					{
						return (typeof obj === "object") && (obj.nodeType === 1) && (typeof obj.style === "object") && (typeof obj.ownerDocument === "object");
					}
				},
				isMobile: function()
				{
					return /(iPhone|iPod|BlackBerry|Android)/.test(navigator.userAgent);
				},
				isDesktop: function()
				{
					return !/(iPhone|iPod|iPad|BlackBerry|Android)/.test(navigator.userAgent);
				},
				getOuterHtml: function(el)
				{
					return $('<div>').append($(el).eq(0).clone()).html();
				},
				// tag detection
				inBlocks: function(tags)
				{
					tags = ($.isArray(tags)) ? tags : [tags];

					var blocks = this.selection.blocks();
					var len = blocks.length;
					var contains = false;
					for (var i = 0; i < len; i++)
					{
						var tag = blocks[i].tagName.toLowerCase();

						if ($.inArray(tag, tags) !== -1)
						{
							contains = true;
						}
					}

					return contains;

				},
				inInlines: function(tags)
				{
					tags = ($.isArray(tags)) ? tags : [tags];

					var inlines = this.selection.inlines();
					var len = inlines.length;
					var contains = false;
					for (var i = 0; i < len; i++)
					{
						var tag = inlines[i].tagName.toLowerCase();

						if ($.inArray(tag, tags) !== -1)
						{
							contains = true;
						}
					}

					return contains;

				},
				isTag: function(current, tag)
				{
					var element = $(current).closest(tag, this.core.editor()[0]);
					if (element.length === 1)
					{
						return element[0];
					}

					return false;
				},
				isBlock: function(block)
				{
					block = block[0] || block;

					return block && this.utils.isBlockTag(block.tagName);
				},
				isBlockTag: function(tag)
				{
					return (typeof tag === 'undefined') ? false : this.reIsBlock.test(tag);
				},
				isInline: function(inline)
				{
					inline = inline[0] || inline;

					return inline && this.utils.isInlineTag(inline.tagName);
				},
				isInlineTag: function(tag)
				{
					return (typeof tag === 'undefined') ? false : this.reIsInline.test(tag);
				},
				// parents detection
				isRedactorParent: function(el)
				{
					if (!el)
					{
						return false;
					}

					if ($(el).parents('.redactor-in').length === 0 || $(el).hasClass('redactor-in'))
					{
						return false;
					}

					return el;
				},
				isCurrentOrParentHeader: function()
				{
					return this.utils.isCurrentOrParent(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
				},
				isCurrentOrParent: function(tagName)
				{
					var parent = this.selection.parent();
					var current = this.selection.current();

					if ($.isArray(tagName))
					{
						var matched = 0;
						$.each(tagName, $.proxy(function(i, s)
						{
							if (this.utils.isCurrentOrParentOne(current, parent, s))
							{
								matched++;
							}
						}, this));

						return (matched === 0) ? false : true;
					}
					else
					{
						return this.utils.isCurrentOrParentOne(current, parent, tagName);
					}
				},
				isCurrentOrParentOne: function(current, parent, tagName)
				{
					tagName = tagName.toUpperCase();

					return parent && parent.tagName === tagName ? parent : current && current.tagName === tagName ? current : false;
				},
				// scroll
				freezeScroll: function()
				{
					this.freezeScrollTop = $(document).scrollTop();
					$(document).scrollTop(this.freezeScrollTop);
				},
				unfreezeScroll: function()
				{
					if (typeof this.freezeScrollTop === 'undefined')
					{
						return;
					}

					$(document).scrollTop(this.freezeScrollTop);
				},
				saveScroll: function()
				{
					this.tmpScrollTop = $(document).scrollTop();
				},
				restoreScroll: function()
				{
					if (typeof this.tmpScrollTop === 'undefined')
					{
						return;
					}

					$(document).scrollTop(this.tmpScrollTop);
				},
				//collapsed
				isCollapsed: function()
				{
					return this.selection.get().isCollapsed;
				},
				isStartOfElement: function(element)
				{
					if (typeof element === 'undefined')
					{
						element = this.selection.block();
						if (!element)
						{
							return false;
						}
					}

					return (this.caret.offset(element) === 0) ? true : false;
				},
				isEndOfElement: function(element)
				{
					if (typeof element === 'undefined')
					{
						element = this.selection.block();
						if (!element)
						{
							return false;
						}
					}

					var text = $.trim($(element).text()).replace(/\t\n\r\n/g, '').replace(/\u200B/g, '');

					return (this.caret.offset(element) === text.length) ? true : false;
				},
				removeEmptyAttr: function(el, attr)
				{
					var $el = $(el);
					if (typeof $el.attr(attr) === 'undefined')
					{
						return true;
					}

					if ($el.attr(attr) === '')
					{
						$el.removeAttr(attr);
						return true;
					}

					return false;
				},
				replaceToTag: function(node, tag)
				{
					var replacement;
					$(node).replaceWith(function()
					{
						replacement = $('<' + tag + ' />').append($(this).contents());

						for (var i = 0; i < this.attributes.length; i++)
						{
							replacement.attr(this.attributes[i].name, this.attributes[i].value);
						}

						return replacement;
					});

					return replacement;
				},
				// select all
				isSelectAll: function()
				{
					return this.selectAll;
				},
				enableSelectAll: function()
				{
					this.selectAll = true;
				},
				disableSelectAll: function()
				{
					this.selectAll = false;
				},
				disableBodyScroll: function()
				{

					var $body = $('html');
					var windowWidth = window.innerWidth;
					if (!windowWidth)
					{
						var documentElementRect = document.documentElement.getBoundingClientRect();
						windowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
					}

					var isOverflowing = document.body.clientWidth < windowWidth;
					var scrollbarWidth = this.utils.measureScrollbar();

					$body.css('overflow', 'hidden');
					if (isOverflowing)
					{
						$body.css('padding-right', scrollbarWidth);
					}
				},
				measureScrollbar: function()
				{
					var $body = $('body');
					var scrollDiv = document.createElement('div');
					scrollDiv.className = 'redactor-scrollbar-measure';

					$body.append(scrollDiv);
					var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
					$body[0].removeChild(scrollDiv);
					return scrollbarWidth;
				},
				enableBodyScroll: function()
				{
					$('html').css({ 'overflow': '', 'padding-right': '' });
					$('body').remove('redactor-scrollbar-measure');
				}
			};
		}
	};

	$(window).on('load.tools.redactor', function()
	{
		$('[data-tools="redactor"]').redactor();
	});

	// constructor
	Redactor.prototype.init.prototype = Redactor.prototype;

})(jQuery);
