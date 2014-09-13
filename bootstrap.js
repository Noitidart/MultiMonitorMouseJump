const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const self = {
	id: 'MultiMonitorMouseJump',
	suffix: '@jetpack',
	path: 'chrome://multimonitormousejump/content/',
	aData: 0,
};
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/devtools/Console.jsm');


function install() {}

function uninstall() {}

function startup(aData, aReason) {
	//self.aData = aData;
}
 
function shutdown(aReason) {
	if (aReason == APP_SHUTDOWN) return;
}
