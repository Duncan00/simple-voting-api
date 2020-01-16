'use strict';

module.exports = {
	extends: ['gitmoji', '@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			// https://gitmoji.carloscuesta.me/
			[
				':art:',
				':zap:',
				':fire:',
				':bug:',
				':ambulance:',
				':sparkles:',
				':memo:',
				':rocket:',
				':lipstick:',
				':tada:',
				':white_check_mark:',
				':lock:',
				':apple:',
				':penguin:',
				':checkered_flag:',
				':robot:',
				':green_apple:',
				':bookmark:',
				':rotating_light:',
				':construction:',
				':green_heart:',
				':arrow_down:',
				':arrow_up:',
				':pushpin:',
				':construction_worker:',
				':chart_with_upwards_trend:',
				':recycle:',
				':whale:',
				':heavy_plus_sign:',
				':heavy_minus_sign:',
				':wrench:',
				':globe_with_meridians:',
				':pencil2:',
				':hankey:',
				':rewind:',
				':twisted_rightwards_arrows:',
				':package:',
				':alien:',
				':truck:',
				':page_facing_up:',
				':boom:',
				':bento:',
				':ok_hand:',
				':wheelchair:',
				':bulb:',
				':beers:',
				':speech_balloon:',
				':card_file_box:',
				':loud_sound:',
				':mute:',
				':busts_in_silhouette:',
				':children_crossing:',
				':building_construction:',
				':iphone:',
				':clown_face:',
				':egg:',
				':see_no_evil:',
				':camera_flash:',
				':alembic:',
				':mag:',
				':wheel_of_dharma:',
				':label:'
			]
		],
		'type-case': [2, 'always', 'lower-case'],
		'type-empty': [2, 'never'],
		'subject-case': [2, 'always', ['sentence-case']],
		'subject-empty': [2, 'never']
	},
	parserPreset: {
		parserOpts: {
			headerPattern: /^(:\w*:)(?:\s)?(?:\((.*?)\))?\s((?:.*(?=\())|.*)/,
			headerCorrespondence: ['type', 'scope', 'subject']
		}
	}
};