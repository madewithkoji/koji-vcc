const fs = require('fs')
const readDirectory = require('./tools/readDirectory.js')
const findRootDirectory = require('./tools/findRootDirectory.js')
const refresh = require('./refresh.js')

class EventBuffering {
	static MAX_DELAY = 1000  // 1000ms = 1 second
	
	constructor() {
		this.reset()
	}
	
	reset() {
		/**
		 * Buffered events
		 * @type {{event: string, fileName: string}[]}
		 */
		this.events = []
		
		/**
		 * The time at which the buffer should be flushed (all buffered events should be handled together)
		 * @type {number}
		 */
		this.flushTime = 0
		
		/**
		 * The holder of {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Return_value timeoutID}.
		 * Zero value means buffering is not started.
		 * @type {number}
		 */
		this.timeoutID = 0
	}
}

const eventBuffering = new EventBuffering()

module.exports = () => {
	console.log('koji-tools watching')
	// const props = JSON.parse(refresh());
	// output what the server wants us to in order to start the preview window
	// console.log(props.config.develop.frontend.events.built);
	// NOTE: figure out what to do about this one, because we cant output this before the server is ready...
	
	// make sure that its in there to start, postinstall has been doing so weird stuff
	refresh()
	// watch the .koji directory from a node_modules directory...
	let root = findRootDirectory()
	readDirectory(root)
			.filter(path => (path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources'))
			.forEach(path => {
				fs.access(path, fs.R_OK, err => {
					if (err) {
						console.error(`Access denied: "${path}".\n${err}`)
						return
					}
					console.log('Watching', path)
					
					fs.watch(path, (event, fileName) => {
						const newEvent = {event: event, fileName: fileName}
						const now = Date.now()
						
						if (now > eventBuffering.flushTime) {
							// Don't handle subsequent events until MAX_DELAY from now
							eventBuffering.flushTime = now + EventBuffering.MAX_DELAY
							handleEvents(newEvent)
							return
						}
						
						eventBuffering.events.push(newEvent)
						
						if (eventBuffering.timeoutID === 0)  // If a timer hasn't already been set
							eventBuffering.timeoutID = setTimeout(() => {
								let bufferedEventsCopy
								
								/*synchronized(eventBuffering.events)*/
								{
									// This block must be synchronized. But not needed to be explicit in Node.js! See https://stackoverflow.com/a/9129149/5318303
									bufferedEventsCopy = eventBuffering.events
									eventBuffering.reset()
								}
								
								handleEvents(...bufferedEventsCopy)
							}, eventBuffering.flushTime - now /* => wait until flushTime */)
					})
				})
			})
}

function handleEvents(...events) {
	for (const event of events) console.log(event.event, event.fileName)
	
	refresh()
}
