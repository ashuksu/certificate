import { dump } from './dump/2025/C_SEC_2405.js';

document.addEventListener('DOMContentLoaded', () => {
	(function () {
		createButtonTestDump();

		const DARKTHEME = 'dark';
		const LIGHTTHEME = 'light';

		let themeDefault = LIGHTTHEME;
		let themeSet = document.querySelector('[data-theme-set]');
		let themeItem = document.querySelector(`[data-theme]`);
		let testTheme = window.sessionStorage.getItem('test_theme');

		if (themeSet) {
			themeDefault = themeSet ? (themeSet.dataset.themeSet || themeDefault) : themeDefault;
		}

		if (themeItem && themeDefault === DARKTHEME) {
			themeItem.classList.add('active');
		}

		if (!testTheme) {
			window.sessionStorage.setItem('test_theme', themeDefault);
		} else {
			if (themeSet) {
				themeSet.dataset.themeSet = testTheme;
			}
			if (testTheme === LIGHTTHEME) {
				document.querySelectorAll('[data-theme]').forEach(elem => {
					elem.classList.remove('active');
				});
			}
		}

		let testDump = window.sessionStorage.getItem('test_dump');
		if (!testDump) {
			let currentDump = document.querySelector('[data-dump]');

			window.sessionStorage.setItem('test_dump', currentDump.dataset.dump);
			testDump = window.sessionStorage.getItem('test_dump');
			currentDump.classList.add('active');
		}

		let data = dump[`${testDump}`];
		if (!data.length) {
			data = dump[document.querySelector('[data-dump]').dataset.dump];
		}

		createButtonSetTotalQuestions(data);

		if (!window.sessionStorage.getItem('test_lim') || !window.sessionStorage.getItem('test_lim_active')) {
			setTotalLim();
		}

		let tempData = cutData(data);

		document.querySelectorAll('[data-dump]').forEach(btn => {
			let dumpVal = btn.dataset.dump;

			if (dumpVal === window.sessionStorage.getItem('test_dump')) {
				btn.classList.add('active');
			}

			btn.addEventListener('click', () => {
				window.sessionStorage.setItem('test_dump', dumpVal);
				data = dump[`${dumpVal}`]
				tempData = cutData(data);

				document.querySelectorAll('[data-dump]').forEach(item => {
					item.classList.remove('active');
				});

				window.sessionStorage.setItem('test_total', data.length);
				btn.classList.add('active');

				createButtonSetTotalQuestions(data);
				setTotalLim(true);
				refresh();
			});
		});

		document.querySelectorAll('[data-total-lim]').forEach(btn => {
			getTotalLim();

			btn.addEventListener('click', () => {
				btn.classList.toggle('active');
				setTotalLim();
				tempData = cutData(data);

				refresh();
			});
		});

		document.querySelector('[data-total]').dataset.total = +window.sessionStorage.getItem('test_total');

		let currentTest = +window.sessionStorage.getItem('test_current');
		if (!currentTest) {
			window.sessionStorage.setItem('test_current', 1);
			currentTest = +window.sessionStorage.getItem('test_current');
		}

		let testMix = window.sessionStorage.getItem('test_mix');
		if (!testMix) {
			window.sessionStorage.setItem('test_mix', 1);
		}

		if (currentTest === 1) {
			let btn = document.querySelector('[data-mix]');

			if (+window.sessionStorage.getItem('test_mix')) {
				btn.classList.add('active');
				btn.dataset.mix = 'mixed';
				mixData(tempData);
			} else {
				btn.classList.remove('active');
				btn.dataset.mix = 'not mixed';
			}

			createTest(tempData);
			sessionStorage.setItem('test_inner', document.getElementById('test').innerHTML);
		} else {
			document.getElementById('test').innerHTML = sessionStorage.getItem('test_inner');
		}

		window.sessionStorage.removeItem('test_end');
		setClock();

		document.querySelectorAll('[data-test]').forEach(test => {
			test.classList.add('show-answers');

			let start = test.querySelector('[data-button="start"]');
			let back = test.querySelector('[data-button="back"]');
			let next = test.querySelector('[data-button="next"]');
			let current = +test.dataset.test;

			if (current === currentTest) {
				test.classList.remove('hidden');
				test.classList.add('current');
			}

			start.addEventListener('click', () => {
				if (current !== 1) {
					checkError(test);
					setError();
				}

				toggleTestItem(1);
			});

			start.addEventListener('click', () => {
				if (current !== 1) {
					checkError(test);
					setError();
				}

				toggleTestItem(1);
			});

			back.addEventListener('click', () => {
				move(-1);
			});

			next.addEventListener('click', () => {
				move();
			});

			test.querySelectorAll('input').forEach(input => {
				if (input.classList.contains('checked')) {
					input.checked = true;
				}

				input.addEventListener('change', () => {
					input.classList.toggle('checked');
					sessionStorage.setItem('test_inner', document.getElementById('test').innerHTML);
				});
			});

			function move(step = 1) {
				step = +step;
				checkError(test);
				setError();
				toggleTestItem(current + step);
			}

			function toggleTestItem(number) {
				let testItem = document.querySelector(`[data-test="${number}"]`);

				if (testItem) {
					// document.querySelector(`[data-test="${current}"]`).classList.add('hidden');
					document.querySelectorAll('[data-test]').forEach(item => {
						item.classList.add('hidden');
						item.classList.remove('current');
					});
					testItem.classList.remove('hidden');
					testItem.classList.add('current');
					window.sessionStorage.setItem('test_current', number);
				} else if (number > 0) {
					console.log('TEST end');
					window.sessionStorage.setItem('test_end', true);

					document.querySelectorAll('[data-countdown="container"]').forEach(timeItem => {
						timeItem.classList.add('hidden');
					});

					document.getElementById('countup').classList.remove('hidden');

					setError('end');
				}

				sessionStorage.setItem('test_inner', document.getElementById('test').innerHTML);
			}

			function checkError(test) {
				let result = 0;

				test.querySelectorAll('[data-answer]').forEach(input => {
					let totalError = document.getElementById('total-error');

					if (input.dataset.answer === 'true') {
						if (!input.checked) {
							result++
							test.dataset.error = result;
							totalError.classList.remove('hidden');
							totalError.querySelector('[data-total-error]').innerHTML = result;
						}
					} else {
						if (input.checked) {
							result++
							test.dataset.error = result;
							totalError.classList.remove('hidden');
							totalError.querySelector('[data-total-error]').innerHTML = result;
						}
					}
				});

				if (!result) {
					test.dataset.error = '';
				}
			}
		});

		document.querySelector('[data-mix]').addEventListener('click', function () {
			let btn = this;
			btn.classList.toggle('active');

			if (btn.classList.contains('active')) {
				btn.dataset.mix = 'mixed';
				window.sessionStorage.setItem('test_mix', 1);
				mixData(data);
			} else {
				btn.dataset.mix = 'not mixed';
				window.sessionStorage.setItem('test_mix', 0);
			}

			refresh();
		});

		document.querySelector('[data-all]').addEventListener('click', function () {
			let btn = this;
			let itemList = document.querySelectorAll('[data-test]');
			btn.classList.toggle('active');

			if (btn.classList.contains('active')) {
				btn.dataset.all = 'show all';
				itemList.forEach(item => {
					item.classList.add('show');
				});
			} else {
				btn.dataset.all = 'hidden';
				itemList.forEach(item => {
					item.classList.remove('show');
				});
			}
		});

		document.querySelector('[data-show-answers]').addEventListener('click', function () {
			let btn = this;
			let itemList = document.querySelectorAll('[data-test]');
			let errorTitle = document.getElementById('total-error');
			btn.classList.toggle('active');

			if (btn.classList.contains('active')) {
				btn.dataset.showAnswers = 'Answers on';
				itemList.forEach(item => {
					item.classList.add('show-answers');
				});
				errorTitle.classList.remove('hide-answers');
			} else {
				btn.dataset.showAnswers = 'Answers off';
				itemList.forEach(item => {
					item.classList.remove('show-answers');
				});
				errorTitle.classList.add('hide-answers');
			}
		});

		document.querySelector('[data-open-answers]').addEventListener('click', function () {
			let btn = this;
			let inputListTrue = document.querySelectorAll('input[data-answer="true"]');
			let inputListFalse = document.querySelectorAll('input[data-answer="false"]');
			let counterListTrue = document.querySelectorAll('.test__question-footer');

			inputListFalse.forEach(input => {
				input.checked = false;
			});

			if (btn.classList.contains('active')) {
				inputListTrue.forEach(input => {
					input.checked = false;
				});

				counterListTrue.forEach(count => {
					count.classList.remove('active');
				});
			} else {
				inputListTrue.forEach(input => {
					input.checked = true;
				});

				counterListTrue.forEach(count => {
					count.classList.add('active');
				});
			}
		});

		document.querySelector('[data-button="reset"]').addEventListener('click', function () {
			if (this.classList.contains('active')) {
				window.sessionStorage.clear();
				refresh();
			}
		});

//misclick for reset
		document.addEventListener("click", function (event) {
			let target = event.target;
			let isButton = false;

			while (target !== null) {
				if (target.classList && target.classList.contains("test__button--reset")) {
					isButton = true;
					break;
				}
				target = target.parentNode;
			}

			if (!isButton) {
				let buttons = document.querySelectorAll(".test__button--reset.active");
				buttons.forEach(function (button) {
					button.classList.remove("active");
				});
			}

			event.stopPropagation();
		});

		document.querySelectorAll('[data-toggle-active]').forEach(item => {
			item.addEventListener('click', () => {
				if (item.dataset.toggleActive === '1') {
					item.classList.add('active');
				} else {
					item.classList.toggle('active');
				}
			});
		});

		document.querySelector('[data-theme]').addEventListener('click', function () {
			let theme = this.classList.contains('active') ? DARKTHEME : LIGHTTHEME;

			if (themeSet) {
				themeSet.dataset.themeSet = theme;
			}

			window.sessionStorage.setItem('test_theme', theme);
		});

		document.addEventListener('keydown', function (event) {
			const keyCode = event.key.toLowerCase().charCodeAt(0);
			let theme = document.querySelector('[data-theme]');

			if (keyCode === 116) { //t
				if (theme) theme.click();
			}

			let current = document.querySelector('.current');
			if (!current) return;

			let back = current.querySelector('[data-button="back"]');
			let next = current.querySelector('[data-button="next"]');
			let start = current.querySelector('[data-button="start"]');
			let reset = document.querySelector('[data-button="reset"]');
			let showAnswers = document.querySelector('[data-show-answers]');
			let testQuestionNumber = current.querySelector('.test__question-footer');
			let mixed = document.querySelector('[data-mix]');
			let hidden = document.querySelector('[data-all]');
			let openAnswers = document.querySelector('[data-open-answers]');

			if (event.key === 'ArrowLeft') {
				if (back) back.click();
			} else if (event.key === 'ArrowRight' || event.key === ' ') {
				if (next) next.click();
			} else if (event.key === 'Home' || event.key === 'Backspace') {
				if (start) start.click();
			} else if (event.key === 'Escape') {
				if (reset) reset.click();
			} else if (event.key === 'ArrowUp') {
				if (showAnswers) showAnswers.click();
			} else if (event.key === 'ArrowDown') {
				if (testQuestionNumber) testQuestionNumber.click();
			} else if (keyCode === 109) { //m
				if (mixed) mixed.click();
			} else if (keyCode === 104) { //h
				if (hidden) hidden.click();
			} else if (keyCode === 111) { //o
				if (openAnswers) openAnswers.click();
			}
		});

		function setTotalLim(reset) {
			let lim = '',
				activeLim = '';

			document.querySelectorAll('[data-total-lim]').forEach(item => {
				lim += +item.dataset.totalLim;
				activeLim += !reset ? +item.classList.contains('active') : 0;
			});

			window.sessionStorage.setItem('test_lim', lim);
			window.sessionStorage.setItem('test_lim_active', activeLim);
		}

		function getTotalLim() {
			let lim = window.sessionStorage.getItem('test_lim');
			let activeLim = window.sessionStorage.getItem('test_lim_active');

			document.querySelectorAll('[data-total-lim]').forEach(btn => {
				let itemLim = btn.dataset.totalLim;
				btn.classList.remove('active');

				for (let i = 0; i < lim.length; i++) {
					if (itemLim === lim[i]) {
						if (+activeLim[i]) {
							btn.classList.add('active');
						}
					}
				}
			});
		}


		function cutData(data) {
			let lim = window.sessionStorage.getItem('test_lim');
			let activeLim = window.sessionStorage.getItem('test_lim_active');
			let result = [];

			document.querySelectorAll('[data-total-lim]').forEach(btn => {
				let itemLim = btn.dataset.totalLim;
				let min = btn.dataset.totalMin;
				let max = btn.dataset.totalMax;

				for (let i = 0; i < lim.length; i++) {
					if (itemLim === lim[i]) {
						if (+activeLim[i]) {
							for (let i = min - 1; i < max; i++) {
								result.push(data[i]);
							}
						}
					}
				}
			});

			document.querySelector('[data-total]').dataset.total = result.length;
			window.sessionStorage.setItem('test_total', result.length);

			return result;
		}

		function shuffle(array) {
			for (let i = array.length - 1; i > 0; i--) {
				let j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
		}

		function mixData(data) {
			shuffle(data);

			for (let elem of data) {
				shuffle(elem.answer);
			}
		}


		function setError(end) {
			let counter = 0;
			let totalError = document.getElementById('total-error');

			totalError.classList.remove('test__title--done', 'test__title--end');
			totalError.classList.add('hidden');
			totalError.dataset.textScore = 'Score:';

			document.querySelectorAll('[data-test]').forEach(item => {
				if (!!item.dataset.error) {
					counter++;
					totalError.classList.remove('hidden');
				}
			});

			totalError.querySelector('[data-total-error]').innerHTML = `${counter} error`;

			if (end) {
				let err = totalError.querySelector('[data-total-error]');
				err.innerHTML = (!counter) ? '100%' : `${getPercent()}% (${counter} error)`;

				totalError.classList.add('test__title--end');
				totalError.classList.remove('hidden');
				totalError.dataset.textScore = 'Failed.';

				if (getPercent() >= 60) {
					totalError.classList.add('test__title--done');
					totalError.dataset.textScore = 'Passed.';
				}
			}

			function getPercent() {
				let testTotal = +window.sessionStorage.getItem('test_total');
				let result = 100 - (100 / testTotal * counter);
				return result.toFixed(2);
			}
		}

		function refresh() {
			let start = document.querySelector('[data-button="start"]');
			if (start) {
				start.click();
			}
			window.location.reload();
		}


		function createButtonTestDump() {
			let list = document.querySelector('[data-button-list="dump"]');
			if (!list) return;

			for (let index in dump) {
				let item = document.createElement('button');
				item.classList.add('test__button');
				item.dataset.dump = index;
				list.append(item);
			}
		}

		function createButtonSetTotalQuestions(dump) {
			let list = document.querySelector('[data-button-list="set-total"]');
			if (!list) return;

			list.innerHTML = '';
			let min = 1;
			let max = 40;

			for (let i = 1; min <= max && i < 20; i++) {
				let item = document.createElement('button');

				item.classList.add('test__button');
				item.dataset.totalLim = i;
				item.dataset.totalMin = min;
				item.dataset.totalMax = max;
				item.innerHTML = '-';

				if (min === max) {
					item.classList.add('test__button--simple');
					item.innerHTML = '';
				}

				list.append(item);

				min = max + 1;

				if (dump.length - max >= 40) {
					max = max + 40;
				} else {
					max = dump.length;
				}
			}
		}


		function createTest(data, total) {
			total = total || data.length;
			let result = '';
			let testList = document.getElementById('test-list');

			for (let i = 0; i < total; i++) {
				data[i].number = i + 1;

				let inner = `<div class="test__question">${data[i].question}</div>
                <p  class="test__question-footer" title="arrow Down" data-toggle-active>${data[i].questionFooter}</p>
                ${createAnswerList(data[i])}
                ${createTestFooter()}`;

				testList.append(createTestItem(data[i], inner));
			}

			return result;
		}

		function createTestItem(data, inner) {
			let item = document.createElement('div');
			item.id = data.id;
			item.classList.add('test__item', 'hidden');
			item.dataset.test = data.number;
			item.innerHTML = inner;

			return item;
		}

		function createAnswer(number, data) {
			return `<label class="test__option"><input type="checkbox" data-answer="${data.bool}"><span>${data.text}</span></label>`;
		}

		function createAnswerList(data) {
			let result = '';

			for (let elem of data.answer) {
				result += createAnswer(data.number, elem);
			}

			return `<div class="test__answer">${result}</div>`;
		}

		function createTestFooter() {
			return `<div class="test__footer">${createButton('start', 'Backspace or Home')} ${createButton('back', 'arrow Left')} ${createButton('next', 'arrow Right of Space')}</div>`;

			function createButton(text, title = '') {
				return `<button class="test__button test__button--${text}" data-button="${text}" title="${title}"></button>`;
			}
		}


		function getTimeRemainingDown(endtime) {
			let t = Date.parse(endtime) - Date.parse(new Date());
			let seconds = Math.floor((t / 1000) % 60);
			let minutes = Math.floor((t / 1000 / 60) % 60);
			let hours = Math.floor((t / (1000 * 60 * 60)) % 24);

			return {
				'total': t,
				'hours': hours,
				'minutes': minutes,
				'seconds': seconds
			};
		}

		function initializeClockDown(selector, endtime) {
			let clock = document.getElementById(selector);
			let hoursSpan = clock.querySelector('[data-countdown="hours"]');
			let minutesSpan = clock.querySelector('[data-countdown="minutes"]');
			let secondsSpan = clock.querySelector('[data-countdown="seconds"]');

			function updateClock() {
				let t = getTimeRemainingDown(endtime);
				hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
				minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
				secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

				if (t.total <= 0) {
					clearInterval(timeinterval);
					console.log('time end');
				}
			}

			updateClock();
			let timeinterval = setInterval(updateClock, 1000);
		}

		function getTimeRemainingUp(newtime) {
			let t = Date.parse(new Date()) - Date.parse(newtime);

			let seconds = Math.floor((t / 1000) % 60);
			let minutes = Math.floor((t / 1000 / 60) % 60);
			let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
			return {
				'total': t,
				'hours': hours,
				'minutes': minutes,
				'seconds': seconds
			};
		}

		function initializeClockUp(id, newtime) {
			let clock = document.getElementById(id);
			let hoursSpan = clock.querySelector('[data-countdown="hours"]');
			let minutesSpan = clock.querySelector('[data-countdown="minutes"]');
			let secondsSpan = clock.querySelector('[data-countdown="seconds"]');

			function updateClock() {
				let t = getTimeRemainingUp(newtime);

				hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
				minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
				secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

				if (window.sessionStorage.getItem('test_end')) {
					clearInterval(timeinterval);
					console.log('time stop');
				}
			}

			updateClock();
			let timeinterval = setInterval(updateClock, 1000);
		}

		function setClock() {
			let number;
			let testTotal = +window.sessionStorage.getItem('test_total');

			if (!testTotal) return;

			document.querySelectorAll('[data-countdown="container"]').forEach(timeItem => {
				timeItem.classList.add('hidden');
			});

			document.getElementById('countup').classList.remove('hidden');

			switch (true) {
				case (testTotal / 40 <= 1):
					number = 1;
					break;
				case (testTotal / 40 <= 2):
					number = 1.5;
					break;
				case (testTotal / 40 <= 3):
					number = 2;
					break;
				case (testTotal / 40 <= 4):
					number = 2.5;
					break;

				default:
					number = 3;
			}

			let deadline = new Date(Date.parse(new Date()) + number * 60 * 60 * 1000);

			initializeClockDown('countdown', deadline);
			initializeClockUp('countup', new Date());

			document.querySelectorAll('[data-countdown="container"]').forEach(timeItem => {
				timeItem.addEventListener('click', function () {
					document.querySelectorAll('[data-countdown="container"]').forEach(item => {
						item.classList.toggle('hidden');
					});
				});
			});
		}
	})();
});
