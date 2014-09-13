const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const self = {
	id: 'MultiMonitorMouseJump',
	suffix: '@jetpack',
	path: 'chrome://multimonitormousejump/content/',
	aData: 0,
};
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/devtools/Console.jsm');

const FLAG_MODIFIER_KEY = {
	Alt: 1000 * 1,
	AltGraph: 1000 * 2,
	Control: 1000 * 3,
	Fn: 1000 * 4,
	Hyper: 1000 * 5,
	Meta: 1000 * 6,
	OS: 1000 * 7,
	Shift: 1000 * 8,
	Super: 1000 * 9,
	Symbol: 1000 * 10
};

const myPrefBranch = 'extensions.' + self.id + '@jetpack.';
var myPrefListener;
//start pref stuff
//needs ES5, i dont know what min browser version of FF starts support for ES5
/**
 * if want to change value of preference dont do prefs.holdTime.value = blah, instead must do `prefs.holdTime.setval(500)`
 * because this will then properly set the pref on the branch then it will do the onChange properly with oldVal being correct
 * NOTE: this fucntion prefSetval is not to be used directly, its only here as a contructor
 */
PrefListener.prototype.prefSetval = function(pass_pref_name, pass_branch_name) {
	//console.log('this outside', this);
	var passBranchObj = this.watchBranches[pass_branch_name];
	var passPrefObj = passBranchObj.prefNames[pass_pref_name];
	var func = function(updateTo, iHave__on_PrefOnObj_Change__butOnNextChangeSkipExecute) {
		var pref_name = pass_pref_name;
		var branch_name = pass_branch_name;
		var branchObj = passBranchObj; //this.watchBranches[branch_name];
		var prefObj = passPrefObj; //branchObj.prefNames[pref_name];
		//console.info('in prefSetval', 'this:', this, 'branchObj', branchObj, 'prefObj', prefObj, 'pref_name', pass_pref_name);
		if (iHave__on_PrefOnObj_Change__butOnNextChangeSkipExecute) {
			var curValOnTree = branchObj._branchLive['get' + typeStr_from_typeLong(prefObj.type) + 'Pref'](pref_name);
			if (curValOnTree == updateTo) {
				console.warn('setval called said to mark it for skipOnChange, however updateTo and curValOnTree are same so on_PrefOnTree_Change will not call after running this updateTo so will not mark for skip');
			} else {
				prefObj.iHave__on_PrefOnObj_Change__butOnNextChangeSkipExecute = new Date().getTime();
			}
		}
		branchObj._branchLive['set' + typeStr_from_typeLong(prefObj.type) + 'Pref'](pref_name, updateTo);
		console.log('set   doooone');
	};
	return func;
}
function typeStr_from_typeLong(typeLong) {
	switch (typeLong) {
		case Ci.nsIPrefBranch.PREF_STRING:
			return 'Char';
		case Ci.nsIPrefBranch.PREF_INT:
			return 'Int';
		case Ci.nsIPrefBranch.PREF_BOOL:
			return 'Bool';
		case Ci.nsIPrefBranch.PREF_INVALID:
			//probably pref does not exist
			throw new Error('typeLong is PREF_INVALID so probably pref DOES NOT EXIST');
		default:
			throw new Error('unrecognized typeLong:', typeLong);
	}
}
///pref listener generic stuff NO NEED TO EDIT
/**
 * @constructor
 *
 * @param {string} branch_name
 * @param {Function} callback must have the following arguments:
 *   branch, pref_leaf_name
 */
 //note: a weakness with this api i made for prefs, is that, if upgrading/downgrading and in installing rev a pref is no longer in use, the old pref will stay in the about:config system. prefs are only deleted when addon is uninstalled note: as of 080314 though i think i have a solution for this, watch the info/warn dump and if it holds true than edit it in
 //note: good thing about this overhaul of the pref skeleton is that i can have this skeleton pasted in, and if no prefs being watched it doesnt do anything funky
function PrefListener() {
	//is an array
  // Keeping a reference to the observed preference branch or it will get garbage collected.
	Object.keys(this.watchBranches).forEach(function(branch_name) {
		this.watchBranches[branch_name]._branchLive = Services.prefs.getBranch(branch_name);
		this.watchBranches[branch_name]._branchDefault = Services.prefs.getDefaultBranch(branch_name);
		//this.watchBranches[branch_name]._branchLive.QueryInterface(Ci.nsIPrefBranch2); //do not need this anymore as i dont support FF3.x
	}.bind(this));
}

PrefListener.prototype.watchBranches = {
	'extensions.MultiMonitorMouseJump@jetpack.': {
		ownType: 0, //0-full, 1-none, 2-partial
		prefNames: {
			'hotkey': {
				owned: true,
				default: 77,
				value: undefined,
				type: Ci.nsIPrefBranch.PREF_INT
			}
		},
		on_UnknownPrefNameOnObj_Change: function(oldVal, newVal, refObj) {
			console.warn('on_UnknownPrefNameOnObj_Change', 'oldVal:', oldVal, 'newVal:', newVal, 'refObj:', refObj);
		}
	}
};

PrefListener.prototype.observe = function(subject, topic, data) {
	//console.log('incoming PrefListener observe :: ', 'topic:', topic, 'data:', data, 'subject:', subject);
	//console.info('compare subject to this._branchLive[extensions.MailtoWebmails@jetpack.]', this.watchBranches[subject.root]._branchLive);
	if (topic == 'nsPref:changed') {
		var branch_name = subject.root;
		var pref_name = data;
		this.on_PrefOnTree_Change(branch_name, pref_name);
	} else {
		console.warn('topic is something totally unexpected it is:', topic);
	}
};

/**
 * @param {boolean=} trigger if true triggers the registered function
 *   on registration, that is, when this method is called.
 */
PrefListener.prototype.register = function(aReason, exec__on_PrefOnObj_Change__onRegister) {
	var branchesOnObj = Object.keys(this.watchBranches);
	for (var i=0; i<branchesOnObj.length; i++) {
		var branch_name = branchesOnObj[i];
		var branchObj = this.watchBranches[branch_name];
		if (branchObj.ownType == 0) {
			var unusedPrefNamesOnTree = branchObj._branchLive.getChildList('', {});
		}
		var prefNamesOnObj = Object.keys(this.watchBranches[branch_name].prefNames);
		for (var j=0; j<prefNamesOnObj.length; j++) {
			var pref_name_on_obj = prefNamesOnObj[j];
			var prefObj = branchObj.prefNames[pref_name_on_obj];
			if (prefObj.owned) {
				prefObj.setval = this.prefSetval(pref_name_on_obj, branch_name);
				if (aReason == ADDON_INSTALL) {
					prefObj.value = prefObj.default;
				} else {
					console.log('not install so fetching value of owned pref, as it should exist, may need to catch error here and on error set to default');
					console.info('aReason == ', aReason);
					try {
						prefObj.value = branchObj._branchLive['get' + typeStr_from_typeLong(prefObj.type) + 'Pref'](pref_name_on_obj);
					} catch(ex) {
						//console.warn('excpetion occured when trying to fetch value, startup is not install so it should exist, however it probably doesnt so weird, so setting it to default, CAN GET HERE IF say have v1.2 installed and prefs were introduced in v1.3, so on update it can get here. ex:', ex); //this may happen if prefs were deleted somehow even though not uninstalled
						console.warn('pref is missing, aReason == ', aReason); //expected if startup and pref value was default value on shutdown. or if upgrade/downgrade to new version which has prefs that were not there in previous version.
						prefObj.value = prefObj.default;
						var prefMissing = true;
					}
				}
				if (prefMissing || [ADDON_INSTALL, ADDON_UPGRADE, ADDON_DOWNGRADE].indexOf(aReason) > -1) {
					if (prefMissing) {
						console.error('setting on default branch because prefMissing is true, aReason btw is ', aReason);
					} else {
						console.error('setting on default branch because aReason == ', aReason);
					}
					branchObj._branchDefault['set' + typeStr_from_typeLong(prefObj.type) + 'Pref'](pref_name_on_obj, prefObj.default);
				} else {
					console.error('NOT setting on default branch because aReason == ', aReason);
				}
				if (branchObj.ownType == 0) {
					var indexOfPrefName_ON_unusedPrefNamesOnTree = unusedPrefNamesOnTree.indexOf(pref_name_on_obj);
					if (indexOfPrefName_ON_unusedPrefNamesOnTree > -1) {
						unusedPrefNamesOnTree.splice(indexOfPrefName_ON_unusedPrefNamesOnTree, 1);
					}
				}
			} else {
				prefObj.type = branchObj._branchLive.getPrefType(pref_name_on_obj); //use _branchLive in case it doesnt have default value //and its got to have _branchLive value as it is NOT owned UNLESS dev messed ownership up
				prefObj.default = branchObj._branchDefault['get' + typeStr_from_typeLong(prefObj.type) + 'Pref'](pref_name_on_obj);
				prefObj.value = branchObj._branchLive['get' + typeStr_from_typeLong(prefObj.type) + 'Pref'](pref_name_on_obj);
				prefObj.setval = this.prefSetval(pref_name_on_obj, branch_name);
			}
		}
		branchObj._branchLive.addObserver('', this, false);
		
		for (var j=0; j<unusedPrefNamesOnTree.length; j++) {
			var pref_name_in_arr = unusedPrefNamesOnTree[j];
			/*
			if (!this._branchDefault) {
				this._branchDefault = Services.prefs.getDefaultBranch(null);
			}
			this._branchDefault.deleteBranch(branch_name + pref_name); //delete default value
			branchObj._branchLive.clearUserPref(pref_name_in_arr); //delete live value
			*/
			Services.prefs.deleteBranch(branch_name + pref_name_in_arr); //deletes the default and live value so pref_name is gone from tree
		}
	}
	
	if (exec__on_PrefOnObj_Change__onRegister) { //for robustness this must not be a per branch or a per pref property but on the whole watchBranches
		for (var i=0; i<branchesOnObj.length; i++) {
			var branch_name = branchesOnObj[i];
			var branchObj = this.watchBranches[branch_name];
			var prefNamesOnObj = Object.keys(this.watchBranches[branch_name].prefNames);
			for (var j=0; j<prefNamesOnObj.length; j++) {
				var pref_name_on_obj = prefNamesOnObj[j];
				var prefObj = branchObj.prefNames[pref_name_on_obj];
				if (prefObj.on_PrefOnObj_Change) {
					var oldVal = undefined; //because this is what value on obj was before i set it to something
					var newVal = prefObj.value;
					var refObj = {
						branch_name: branch_name,
						pref_name: pref_name_on_obj,
						prefObj: prefObj,
						branchObj: branchObj
					};
					prefObj.on_PrefOnObj_Change(oldVal, newVal, refObj);
				}
			}
		}
	}
};

PrefListener.prototype.unregister = function() {
	var branchesOnObj = Object.keys(this.watchBranches);
	for (var i=0; i<branchesOnObj.length; i++) {
		var branch_name = branchesOnObj[i];
		var branchObj = this.watchBranches[branch_name];
		branchObj._branchLive.removeObserver('', this);
		console.log('removed observer from branch_name', branch_name);
	}
};

PrefListener.prototype.uninstall = function(aReason) {
	console.log('in PrefListener.uninstall proc');
	if (aReason == ADDON_UNINSTALL) {
		var branchesOnObj = Object.keys(this.watchBranches);
		for (var i=0; i<branchesOnObj.length; i++) {
			var branch_name = branchesOnObj[i];
			var branchObj = this.watchBranches[branch_name];
			if (branchObj.ownType == 0) {
				Services.prefs.deleteBranch(branch_name);
			} else {
				var prefNamesOnObj = Object.keys(this.watchBranches[branch_name].prefNames);
				for (var j=0; j<prefNamesOnObj.length; j++) {
					var pref_name_on_obj = prefNamesOnObj[j];
					var prefObj = branchObj.prefNames[pref_name_on_obj];
					if (prefObj.owned) {
						Services.prefs.deleteBranch(branch_name + pref_name_on_obj);
					}
				}
			}
		}
	} else {
		console.log('not real uninstall so quitting preflistener.uninstall proc');
	}
};

PrefListener.prototype.on_PrefOnTree_Change = function (branch_name, pref_name_on_tree) {
	console.log('on_PrefOnTree_Change', 'pref_name_on_tree:', pref_name_on_tree, 'branch_name:', branch_name);
	var branchObj = this.watchBranches[branch_name];
	var refObj = {
		branch_name: branch_name,
		pref_name: pref_name_on_tree,
		branchObj: branchObj
	};
	if (pref_name_on_tree in branchObj.prefNames) {
		var prefObj = branchObj.prefNames[pref_name_on_tree];
		var oldVal = prefObj.value;
		try {
			var newVal = branchObj._branchLive['get' + typeStr_from_typeLong(prefObj.type) + 'Pref'](pref_name_on_tree);
		} catch (ex) {
			console.info('probably deleted', 'newVal exception:', ex);
		}
		refObj.prefObj = prefObj;
		if (prefObj.iHave__on_PrefOnObj_Change__butOnNextChangeSkipExecute) {
			var msAgo_markedForSkip = new Date().getTime() - prefObj.iHave__on_PrefOnObj_Change__butOnNextChangeSkipExecute;
			console.log('skipping this onChange as 2nd arg told to skip it, it was marked for skip this many ms ago:', msAgo_markedForSkip);
			delete prefObj.iHave__on_PrefOnObj_Change__butOnNextChangeSkipExecute
		} else {
			if (prefObj.on_PrefOnObj_Change) {
				prefObj.on_PrefOnObj_Change(oldVal, newVal, refObj);
			} else {
				//do nothing
			}
		}
		prefObj.value = newVal;
		console.log('prefObj value updated, prefObj:', prefObj);
	} else {
		if (branchObj.on_UnknownPrefNameOnObj_Change) {
			var oldVal = null; //i actually dont know if it existed before
			refObj.type = branchObj._branchLive.getPrefType(pref_name_on_tree);
			console.info('refObj.type:', refObj.type);
			if (refObj.type == 0) {
				console.info('unknownNameOnObj pref probably deleted');
				newVal = null;
			}
			var newVal = branchObj._branchLive['get' + typeStr_from_typeLong(refObj.type) + 'Pref'](pref_name_on_tree);
			refObj.setval = function(updateTo) {
				branchObj._branchLive['set' + typeStr_from_typeLong(refObj.type) + 'Pref'](pref_name_on_tree, updateTo);
			}
			branchObj.on_UnknownPrefNameOnObj_Change(oldVal, newVal, refObj);
		} else {
			//do nothing
		}
	}
	console.log('DONE on_PrefOnTree_Change');
};
////end pref listener stuff
//end pref stuff

/*start - windowlistener*/
var windowListener = {
	//DO NOT EDIT HERE
	onOpenWindow: function (aXULWindow) {
		// Wait for the window to finish loading
		let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		aDOMWindow.addEventListener('load', function () {
			aDOMWindow.removeEventListener('load', arguments.callee, false);
			windowListener.loadIntoWindow(aDOMWindow);
		}, false);
	},
	onCloseWindow: function (aXULWindow) {},
	onWindowTitleChange: function (aXULWindow, aNewTitle) {},
	register: function () {
		// Load into any existing windows
		let DOMWindows = Services.wm.getEnumerator(null);
		while (DOMWindows.hasMoreElements()) {
			let aDOMWindow = DOMWindows.getNext();
			windowListener.loadIntoWindow(aDOMWindow);
		}
		// Listen to new windows
		Services.wm.addListener(windowListener);
	},
	unregister: function () {
		// Unload from any existing windows
		let DOMWindows = Services.wm.getEnumerator(null);
		while (DOMWindows.hasMoreElements()) {
			let aDOMWindow = DOMWindows.getNext();
			windowListener.unloadFromWindow(aDOMWindow);
		}
		
		for (var u in unloaders) {
			unloaders[u]();
		}
		
		//Stop listening so future added windows dont get this attached
		Services.wm.removeListener(windowListener);
	},
	//END - DO NOT EDIT HERE
	loadIntoWindow: function (aDOMWindow) {
		if (!aDOMWindow) {
			return;
		}
		
		aDOMWindow.addEventListener('keyup', keyup, false);		
	},
	unloadFromWindow: function (aDOMWindow) {
		if (!aDOMWindow) {
			return;
		}
		
		aDOMWindow.removeEventListener('keyup', keyup, false);
	}
};
/*end - windowlistener*/

function install() {}

function uninstall() {}

function startup(aData, aReason) {
	//self.aData = aData;
	windowListener.register();
}
 
function shutdown(aReason) {
	if (aReason == APP_SHUTDOWN) return;
	
	windowListener.unregister();
}

function keyup(e) {
	var keyFlags = e.keyCode;
	for (var p in FLAG_MODIFIER_KEY) {
		if (e.getModifierState(p)) {
			keyFlags |= FLAG_MODIFIER_KEY[p];
		}
	}
	if (keyFlags == myPrefListener.watchBranches[myPrefBranch].prefNames.hotkey.value) {
		//do jump
	}
}
