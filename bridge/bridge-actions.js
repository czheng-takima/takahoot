const BRIDGE_OUT = require('../common/bridge-actions.json').OUT;

function initSuccess(data) {
    return {
        type: BRIDGE_OUT.INIT_SUCCESS, data
    };
}

function connectSuccess() {
    return {
        type: BRIDGE_OUT.CONNECT_SUCCESS
    };
}

function calibratingSuccess() {
    return {
        type: BRIDGE_OUT.CALIBRATING_SUCCESS,
    };
}

function buttonHit(btnId) {
    return {
        type: BRIDGE_OUT.BUTTON_HIT, data: { btnId }
    };
}

module.exports = {
    initSuccess,
    connectSuccess,
    calibratingSuccess,
    buttonHit,
};
