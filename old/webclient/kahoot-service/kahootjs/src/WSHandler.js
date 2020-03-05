const userAgents = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36";
import consts from "./consts.js";
import EventEmitter from "./EventEmitter.js";

class WSHandler extends EventEmitter {
	constructor(session, token, kahoot) {
		super();
		this.requires2Step = false;
		this.finished2Step = false;
		this.kahoot = kahoot;
		this.msgID = 0;
		this.clientID = "_none_";
		this.connected = false;
		this.gameID = session;
		this.name = "";
		this.firstQuizEvent = false;
		this.lastReceivedQ = null;
		this.ws = new WebSocket(consts.WSS_ENDPOINT + session + "/" + token);
		// Create anonymous callbacks to prevent an event emitter loop
		this.ws.onopen = (() => {
			this.open();
		});
		this.ws.onmessage = (msg => {
			this.message(msg);
		});
		this.ws.onclose = (() => {
			this.connected = false;
			this.close();
		});
		this.dataHandler = {
			1: (data, content) => {
				try {
					//if joining during the quiz
					if (!this.kahoot.quiz) {
						this.emit("quizData", {
							name: null,
							type: content.quizType,
							qCount: content.quizQuestionAnswers[0],
							totalQ: content.quizQuestionAnswers.length,
							quizQuestionAnswers: content.quizQuestionAnswers
						});
					}
					if (!this.kahoot.quiz.currentQuestion) {
						this.emit("quizUpdate", {
							questionIndex: content.questionIndex,
							timeLeft: content.timeLeft,
							type: content.gameBlockType,
							useStoryBlocks: content.canAccessStoryBlocks,
							ansMap: content.answerMap
						});
					} else if (content.questionIndex > this.kahoot.quiz.currentQuestion.index) {
						this.emit("quizUpdate", {
							questionIndex: content.questionIndex,
							timeLeft: content.timeLeft,
							type: content.gameBlockType,
							useStoryBlocks: content.canAccessStoryBlocks,
							ansMap: content.answerMap
						});
					}
				} catch (e) {
					console.log("BEGIN_QUIZ_ERROR"); //You should never see this error...
				}
			},
			2: (data, content) => {
				this.emit("questionStart");
			},
			3: (data, content) => {
				this.emit("finish", {
					playerCount: content.playerCount,
					quizID: content.quizId,
					rank: content.rank,
					correct: content.correctCount,
					incorrect: content.incorrectCount
				});
			},
			4: (data, content) => {
				// this.emit("questionSubmit", content.questionNumber);
			},
			8: (data, content) => {
				// console.log(data);
				this.emit("questionEnd", {
					correctAnswers: content.correctAnswers,
					correct: content.isCorrect,
					points: content.points,
					pointsData: content.pointsData,
					rank: content.rank,
					nemesis: content.nemesis,
					text: content.text,
					totalScore: content.totalScore
				});
			},
			9: (data, content) => {
				if (!this.firstQuizEvent) {
					this.firstQuizEvent = true;
					this.emit("quizData", {
						name: content.quizName,
						type: content.quizType,
						qCount: content.quizQuestionAnswers[0],
						totalQ: content.quizQuestionAnswers.length,
						quizQuestionAnswers: content.quizQuestionAnswers
					});
				}
			},
			10: (data, content) => {
				// The quiz has ended
				this.emit("quizEnd");
				try {
					this.ws.close();
				} catch (e) {
					// Most likely already closed
				}
			},
			13: (data, content) => {
				this.emit("finishText", {
					metal: content.podiumMedalType
				});
			},
			12: (data, content) => {
				this.emit("feedback");
			}
		};
	}
	getExt() {
		return {
			ack: true,
			timesync: {
				l: 0,
				o: 0,
				tc: (new Date).getTime()
			}
		};
	}
	getPacket(packet) {
		var l, o;
		try {
			l = Math.round(((new Date).getTime() - packet.ext.timesync.tc - packet.ext.timesync.p) / 2);
			o = (packet.ext.timesync.ts - packet.ext.timesync.tc - l);
			this.timesync = {
				tc: (new Date).getTime(),
				l: l,
				o: o
			};
		} catch (err) {
			this.timesync = {
				tc: (new Date).getTime(),
				l: 0,
				o: 0
			};
		}
		this.msgID++;
		return [{
			channel: packet.channel,
			clientId: this.clientID,
			ext: {
				ack: packet.ext.ack,
				timesync: {
					l: l,
					o: o,
					tc: (new Date).getTime()
				}
			},
			id: this.msgID + ""
		}];
	}
	getSubmitPacket(questionChoice) {
		this.msgID++;
		const r = [{
			channel: "/service/controller",
			clientId: this.clientID,
			data: {
				content: JSON.stringify({
					choice: questionChoice,
					questionIndex: this.kahoot.quiz.currentQuestion.index,
					meta: {
						lag: 30
					}
				}),
				gameid: this.gameID,
				host: consts.ENDPOINT_URI,
				id: 45,
				type: "message"
			},
			id: this.msgID + ""
		}];
		// for question type "open_ended," expect a string.
		if (typeof(questionChoice) == "string") {
			r[0].data.content = JSON.stringify({
				// Random change in kahoot API ! text -> choice
				//text: questionChoice,
				choice: parseInt(questionChoice),
				type: "quiz",
				questionIndex: this.kahoot.quiz.currentQuestion.index,
				meta: {
					lag: 30
				}
			});
		}
		return r;
	}
	send(msg) {
		return new Promise((res, rej) => {
			if (this.connected) {
				try {
					//console.log("U " + JSON.stringify(msg));
					this.ws.send(JSON.stringify(msg), res);
				} catch (e) {}
			}
		});
	}
	sendSubmit(questionChoice) {
		var packet = this.getSubmitPacket(questionChoice);
		this.send(packet).then(() => {
			const snark = ["Toooo fast?", "Genius machine?", "Pure luck or true genius?"];
			this.emit("questionSubmit", snark[Math.floor(Math.random() * snark.length)]);
		});
	}
	open() {
		this.connected = true;
		this.emit("open");
		var r = [{
			advice: {
				interval: 0,
				timeout: 60000
			},
			channel: consts.CHANNEL_HANDSHAKE,
			ext: {
				ack: true,
				timesync: {
					l: 0,
					o: 0,
					tc: (new Date).getTime()
				},
				id: "1",
				minimumVersion: "1.0",
				supportedConnectionTypes: [
					"websocket",
					"long-polling"
				],
				version: "1.0"
			}
		}];
		this.msgID++;
		this.send(r);
	}
	message(msg) {
		//console.log("D " + msg);
		var data = JSON.parse(msg.data)[0];
		if (data.channel == consts.CHANNEL_HANDSHAKE && data.clientId) { // The server sent a handshake packet
			this.clientID = data.clientId;
			var r = this.getPacket(data)[0];
			r.advice = {
				timeout: 0
			};
			r.channel = "/meta/connect";
			r.connectionType = "websocket";
			r.ext.ack = 0;
			this.send([r]);
		} else if (data.channel == consts.CHANNEL_CONN && data.advice && data.advice.reconnect && data.advice.reconnect == "retry") {
			//connect packet
			var connectionPacket = {
				ext: {
					ack: 1,
					timesync: this.timesync
				},
				id: ++this.msgID + ""
			};
			connectionPacket.channel = consts.CHANNEL_CONN;
			connectionPacket.clientId = this.clientID;
			connectionPacket.connectionType = "websocket";
			this.send(connectionPacket);
			this.emit("ready");
			this.ready = true;
		} else if (data.channel == consts.CHANNEL_SUBSCR) {
			if (data.subscription == "/service/controller" && data.successful == true && !this.ready) {
				this.emit("ready");
				this.ready = true;
			}
		} else if (data.data) {
			if (data.data.error) {
				if (data.data.type && data.data.type == "loginResponse") {
					return this.emit("invalidName");
				}
				try {
					this.emit("error", data.data.error); //error here if stuff
				} catch (er) {
					//error. usually due to username taken
				}
				return;
			} else if (data.data.type == "loginResponse") {
				// "/service/controller"
				this.kahoot.cid = data.data.cid;
				this.emit("joined");
			} else {
				if (data.data.content) {
					var cont = JSON.parse(data.data.content);
					if (this.dataHandler[data.data.id]) {
						this.dataHandler[data.data.id](data, cont);
					} else {
						// console.log(data);
					}
				}
			}
		}
		if (data.ext && data.channel == "/meta/connect" && this.ready) {
			var packet = this.getPacket(data)[0];
			packet.connectionType = "websocket";
			this.send([packet]);
		}
		/*if(data.channel == "/service/player"){
			console.log(data.data);
		}*/
		if (!this.finished2Step && data.channel == "/service/player" && data.data) {
			if (data.data.id == 52) {
				this.finished2Step = true;
			} else if (data.data.id == 53) {
				this.requires2Step = true;
				this.emit("2step");
			}
		}
	}
	send2Step(steps) {
		var packet = [{
			channel: "/service/controller",
			clientId: this.clientID,
			data: {
				id: 50,
				type: "message",
				gameid: this.gameID,
				host: consts.ENDPOINT_URI,
				content: JSON.stringify({
					sequence: steps
				})
			},
			id: this.msgID + ""
		}];
		this.send(packet);
	}
	sendFeedback(fun, learning, recommend, overall) {
		var packet = [{
			channel: "/service/controller",
			clientId: this.clientID,
			data: {
				id: 11,
				type: "message",
				gameid: this.gameID,
				host: consts.ENDPOINT_URI,
				content: JSON.stringify({
					totalScore: this.kahoot.totalScore,
					fun: fun,
					learning: learning,
					recommend: recommend,
					overall: overall,
					nickname: this.kahoot.name
				})
			},
			id: this.msgID + ""
		}];
		this.send(packet);
	}
	relog(cid) {
		if (!this.ready) {
			setTimeout(() => {
				this.relog(cid);
			}, 500);
			return;
		}
		this.msgID++;
		let packet = {
			channel: "/service/controller",
			clientId: this.clientID,
			data: {
				cid: cid,
				content: JSON.stringify({
					device: {
						userAgent: userAgents,
						screen: {
							width: 2000,
							height: 1000
						}
					}
				}),
				gameid: this.gameID,
				host: "kahoot.it",
				type: "relogin"
			},
			ext: {},
			id: this.msgID + ""
		};
		this.send([packet]);
	}
	login(name, team) {
		if (!this.ready) {
			setTimeout(() => {
				this.login(name);
			}, 500);
			return;
		}
		this.name = name;
		var joinPacket = [{
			channel: "/service/controller",
			clientId: this.clientID,
			data: {
				content: '{"device":{"userAgent":"' + userAgents + '","screen":{"width":1280,"height":800}}}',
				gameid: this.gameID,
				host: consts.ENDPOINT_URI,
				name: this.name,
				type: "login"
			},
			ext: {},
			participantUserId: null,
			id: this.msgID + ""
		}];
		this.msgID++;
		this.send(joinPacket);
		if (this.kahoot.gamemode == "team") {
			const joinPacket2 = [{
				channel: "/service/controller",
				clientId: this.clientID,
				data: {
					content: JSON.stringify(team && typeof(team.push) == "function" && team.length ? team : ["Player 1", "Player 2", "Player 3", "Player 4"]),
					gameid: this.gameID,
					host: consts.ENDPOINT_URI,
					id: 18,
					type: "message"
				},
				ext: {},
				participantUserId: null,
				id: this.msgID + ""
			}];
			this.msgID++;
			this.send(joinPacket2);
		}
	}
	close() {
		this.connected = false;
		this.emit("close");
	}
	leave() {
		this.msgID++;
		try {
			this.timesync.tc = Date.now();
		} catch (err) {
			console.log(err);
		}
		//console.log(me.timesync);
		this.send([{
			channel: "/meta/disconnect",
			clientId: this.clientID,
			ext: {
				timesync: this.timesync
			},
			id: this.msgID + ""
		}]).then(setTimeout(() => {
			this.ws.close();
		}, 500));
	}
}
export default WSHandler;
