'use strict';

function handleExit({server, app, logger, redis}) {
	return function() {
		logger.info('Signal received application starts shutdown');
		if (!app.isTerminating) {
			// Let everything know that we wish to exit gracefully
			// eslint-disable-next-line no-param-reassign
			app.isTerminating = true;

			return server.close(async () => {
				await Promise.all([redis.quit()]);

				logger.info('Application had gracefully shutdown');
				process.exit();
			});
		}
		return Promise.resolve();
	};
}

module.exports = handleExit;
