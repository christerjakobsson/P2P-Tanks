/**
 * P2P-Bomberman configuration object.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

var Conf = {
	turnSpeed: 4,					// Player turn seeed
	playerSpeed: 8,				// Player movement speed
	maxNumPlayers: 4,				// max. number of players in a game
	maxBombStrength: 5,				// max. bomb strength by upgrades
	upgradePossibility: 0.10,		// possibility rate of wheather an upgrade occurs or not
	bombTimerMs: 2000,				// bomb ticking time
	moveKeyRepeatTimeMs: 60,		// max. move key repeat time
	bombKeyRepeatTimeMs: 50,		// max. bomb key repeat time
	peerJsKey: 'br03fw97a5uerk9',		// peer.js server host
	peerJsPort: 9000,				// peer.js server host port
	peerJsDebug: true,				// peer.js debug mode
	arrowKeyMapping: new Array(		// key mapping for arrow keys configuration
			37, 39,
			38, 40,
			66
		),
	wsadKeyMapping: new Array(		// key mapping for WSAD keys configuration
			'a', 'd',
			'w', 's',
			'x'
		)
};
