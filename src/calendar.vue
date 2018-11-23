<template>
    <div class="vdp__container">
		<div class="vdp__input_wrapper">
			<input type="text" 
				class="vdp__input vdp__input-start"
				:class="{active: openFromInput === 'start' && isVisible}"
				:value="dateStart === null ? '' : dateStart.format(params.format)"
				:placeholder="params.placeholderStart"
				v-on:click="(e) => e.stopPropagation()"
				v-on:focus.prevent="showCalendar('start')"
				readonly>

			<input type="text"
				class="vdp__input vdp__input-end" 
				:class="{active: openFromInput === 'end' && isVisible}"
				:value="dateEnd === null ? '' : dateEnd.format(params.format)"
				:placeholder="params.placeholderEnd"
				v-show="params.type === 'rangedate'"
				v-on:click="(e) => e.stopPropagation()"
				v-on:focus.prevent="showCalendar('end')"
				readonly>
		</div>
        
        <div v-bind:class="{ show: isVisible }" class="vdp">
            <div class="vdp__wrapper">
                <div class="vdp__calendar" v-on:click="(e) => e.stopPropagation()">
                    <div class="vdp__calendar_head">
                        <div class="vdp__calendar_head_month">
                            <i class="prev" v-on:click.prevent="changeViewDate('month', 'subtract')"> < </i>
                            <span>{{ viewDate.format('MMMM YYYY') }}</span>
                            <i class="next" v-on:click.prevent="changeViewDate('month', 'add')"> > </i>
                        </div>
                    </div>
                    <div class="vdp__calendar_body">
                        <div class="vdp__calendar_m">
                            <div class="vdp__calendar_m_w">
                                <div v-for="day in weekShortDays" 
									:key="day" 
									class="vdp__calendar_m_w_n">{{day}}</div>
                            </div>
                        </div>
						<!-- Calendar month days -->
						<div class="vdp__calendar_days">
							<!-- Render "empty days" -->
							<div v-for="(day, index) in viewDate.clone().startOf('month').weekday()"
								:key="index"
								class="vdp__calendar_days_day-empty"></div>

							<!-- Render month days -->
							<div v-for="(day, index) in viewDate.daysInMonth()" 
								:key="index+'day'"
								:class=dayClass(day)
								v-on:click.prevent="setActiveDate(day)">
								{{day}}
							</div>
						</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import moment from "moment";

export default {
    name: "vue-moment-daterange-picker",
    props: {
        options: {
			type: Object,
			required: true
		}
    },
    data () {
        return {
            params: {},
			openFromInput: 'start',
			viewDate: null,
			dateStart: null,
			dateEnd: null,
            weekShortDays: moment.weekdaysShort(),
            isVisible: false,
            eventNamespace: btoa(Math.random())
        }
	},
    computed: {
		dayClass: function () {
			return (dayNum) => {
				let dayClass='',
					forDate = moment(this.viewDate.format('YYYY-MM') + '-' + (dayNum < 10 ? '0' + dayNum : dayNum) );

				if (forDate.isSame(this.dateStart, 'day')) {
					dayClass = 'active ';
				} else if (forDate.isSame(this.dateEnd, 'day') && this.params.type === 'rangedate') {
					dayClass = 'active ';
				} else {
					dayClass = '';
				}

				//Add class for between dates
				if (this.params.type === 'rangedate' && forDate.isAfter(this.dateStart, 'day') && forDate.isBefore(this.dateEnd, 'day')) {
					dayClass += 'between ';
				}
				
				//Add class for disabled dates
				//Check max and min dates
				if(typeof this.params.minDate === 'object' && forDate.isBefore(this.params.minDate)) dayClass += 'disabled';
				if(typeof this.params.maxDate === 'object' && forDate.isAfter(this.params.maxDate)) dayClass += 'disabled';

				return dayClass + ' vdp__calendar_days_day'
			}
		}
    },
    mounted() {
		let document = window.document;
		document.addEventListener('click', e => this.hideCalendar(e));
		//Hide calendar on show another calendar page
		document.addEventListener('vdp-show', e => this.hideCalendar(e));
	},
	beforeDestroy() {
		let document = window.document;
		//TODO unsubsctibe events
	},
	beforeCreate() {
		//set default locale
		moment.locale("ru");
	},
    created() {
		//Merge user options with default params
		this.params = Object.assign({
			type: 'date', // || rangedate
                startDate: null, //startDate
                endDate: null, //endDate
                locale: 'ru',
                format: 'YYYY.MM.DD', //Display date format
				placeholderStart: 'Start date',
				placeholderEnd: 'End date',
                minDate: null, //min available moment date
                maxDate: null, //max available moment date
                firstDayOfWeek: moment.localeData().firstDayOfWeek(), //first number day of the week
			}, this.options);
		
		moment.locale(this.params.locale);

        //Current view date in calendar
        this.viewDate = this.params.startDate === null ? moment() : this.params.startDate.clone();

		//Selected date - view on top
        this.dateStart = this.params.startDate;
        this.dateEnd = this.params.endDate;

        // update day names order to firstDayOfWeek 
        if (this.params.firstDayOfWeek !== 0) {
			let i = this.params.firstDayOfWeek,
				weekShortDays = this.weekShortDays.map(d => d);
            while (i > 0) {
                weekShortDays.push(weekShortDays.shift());
                i--;
			}
			this.weekShortDays = weekShortDays;
        }
    },
    methods: {
		/**
		 * Show calendar and trigger vdp-show event
		 */
        showCalendar(type) {
			this.openFromInput = type;
			this.triggerWindowEvent('vdp-show');
			this.$emit('vdp-show');
            this.isVisible = true;
		},

		/**
		 * Hide calendar, set initial viewDate state
		 */
        hideCalendar(event) {
			if(this.isVisible) {
				this.$emit('vdp-hide');
				this.viewDate = this.dateStart === null ? moment() : this.dateStart.clone();
				this.isVisible = false;
			}
		},

		/**
		 * Trigger custom event at window.document
		 */
		triggerWindowEvent (eventName) {
			window.document.dispatchEvent(new CustomEvent(eventName));
		},

        /**
         * Set next or prev date by params
         * @param  {Object} event    jQuery event
         * @param  {String} calendar end or start type 
         * @param  {String} dateType day or week or month or year
         * @param  {String} action add\subtract
         * @return {void}          
         */
        changeViewDate(dateType = 'day', action = 'add') {
			this.viewDate = moment(this.viewDate[action](1, dateType));
		},
		
		/**
		 * Emit new date values to top components
		 */
		emitValues() {
			this.$emit('vdp-change', {
				startDate: this.dateStart,
				endDate: this.dateEnd
			})
		},

		/**
         * Set active date after click on day in calendar
         * @param {Object} event jquery event
         * @param {String} type  end or start date type
         */
        setActiveDate(dayNum) {
			let params = this.params,
				date = moment(this.viewDate.format('YYYY-MM') + '-' + ((String(dayNum).length === 1) ? '0' + dayNum : dayNum));
			            
            //Check max and min dates
			if(typeof params.minDate === 'object' && date.isBefore(params.minDate) || 
			typeof params.maxDate === 'object' && date.isAfter(params.maxDate)) return;
			
			if(params.type === 'rangedate') {
				if (this.openFromInput === 'start') {
					if(this.dateEnd === null) {
						this.openFromInput = 'end';
						this.dateEnd = date
					} else {
						if (date.isAfter(this.dateEnd, 'day')) {
							this.dateEnd = date;
							this.dateStart = date.clone().add(1, "day");
						} else {
							this.dateStart = date;
						}
					}
				} else {
					if(this.dateStart === null) {
						this.dateStart = date;
						this.openFromInput = 'start';
					} else {
						if (date.isBefore(this.dateStart, 'day')) {
							this.dateStart = date;
						} else {
							this.dateEnd = date;
						}
					}
				}
			} else {
				this.dateStart = date;
			}
			this.viewDate = date.clone();
			this.emitValues();
        }
    }
}
</script>
<style lang="scss" scoped>
$orange: #FF7F00;

$mainColor: $orange;
$textColor: #999;
$cloud: #ecf0f1;
.vdp {
	transition: all 0.3s ease;
	z-index: 100;
	width: 0;
	height: 0;
	font-family: sans-serif;
	&.show { 
		width: auto;
		height: auto;
		& .vdp__wrapper {
			overflow: inherit;
			max-width: 600px;
			max-height: 520px;
			opacity:1;
			display: block;
			border-radius: 0;
		}
		& .dt-modal_wrapper {
			z-index: 200;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			width: 100%;
			height: 100%;
		}
	}
	&__container {
		position: relative;
	}
	&__input {
		&_wrapper {
			max-width: 320px;
			display: flex;
			position: relative;
			flex-wrap: nowrap;
		}
		border: 1px solid rgba(32, 36, 56, 0.2);
		height: 40px;
		box-sizing: border-box;
		border-radius: 4px;
		padding: 0 10px;
		flex:1;
		transition: all 0.25s ease;
		&-start {
			margin-right: 5px;
		}
		&-end {
			margin-left: 5px;
		}
		&:focus, &.active {
			outline: none;
			border: 1px solid $mainColor;
		}
	}
	&__footer {
		&_close {
			box-sizing: border-box;
		    cursor: pointer;
		    font-family: 'Roboto', 'Arial', sans-serif;
		    font-weight: 300;
		    display: inline-block;
		    color: #000;
		    background: $cloud;
		    letter-spacing: .5px;
		    font-size: 15px;
		    border-radius: 3px;
		    line-height: 36px;
		    height: 36px;
		    padding: 0 10px;
		    text-decoration: none !important;
		    outline: 0;
		    border: 0;
			-webkit-tap-highlight-color: transparent;
			vertical-align: middle;
			text-transform: uppercase;
			box-shadow: 2px 3px 5px rgba(0,0,0,0.15);
		    transition: all 0.3s ease;
		    &:focus {
		        outline: none;
		    }
		    &:hover {
		       background: $cloud*1.05;
		    }
		    &:active {
		        box-shadow: 1px 1px 2px rgba(0,0,0,0.15);
		    }
		}
	}
	&__wrapper {
		position: absolute;
		background-color: #fff;
		top: 50px;
		left: 0;
		z-index: 100;
		transition: all 0.3s ease;
		opacity: 0.5;
		max-height: 0px;
		max-width: 0px;
		overflow: hidden;
		border-radius: 30%;
		box-shadow: 1px 2px 8px rgba(0,0,0,0.15);
	}
	&__calendar {
		font-size: 0px;
		display: block;
		flex-wrap: wrap;
		padding: 0 20px 20px;
		max-width: 320px;
		user-select: none;
		box-sizing: border-box;
		&_days {
			display: flex;
			flex-wrap: wrap;
			//Day
			&_day {
				transition: all 0.3s ease;
				border-radius: 4px;
				position: relative;
				vertical-align: top;
				display: inline-block;
				line-height: 40px;
				width: 40px;
				text-align: center;
				height: 40px;
				font-size: 14px;
				cursor: pointer;
				font-weight: 300;
				user-select: none;
				&:hover {
					background-color: $cloud;
				}
				&-empty {
					border-radius: 50%;
					display: inline-block;
					line-height: 40px;
					width: 40px;
					text-align: center;
					height: 40px;
					font-size: 16px;
					cursor: pointer;
				}
				&.active {
					background-color: $mainColor;
					color: #fff;
				}
				&.between {
					background: rgba(255, 127, 0, 0.2);
					box-sizing: border-box;
					position: relative;
					border-radius: 0;
				}
				&.disabled {
					opacity: 0.3;
					pointer-events: none;
				}
			}
		}
		&_head {
			font-size: 14px;
			text-align: center;
			padding: 20px 0;
			height: 62px;
			box-sizing: border-box;
			line-height: 20px;
			
			&_wday {
				line-height: 25px;
				color: #fff;
				display: block;
				width: 100%;
				font-size: 12px;
				background: rgba(0,0,0,0.2);
				text-transform: uppercase;
				font-weight: 300;
			}
			&_month {
				color:#202438;
				font-size: 16px;
				display: flex;
				justify-content: space-between;
				height: 30px;
				font-weight: 300;
				line-height: 20px;
				& > span {
					display: inline-block;
					min-width: 100px;
				}
			}
			.next, .prev {
				width: 24px;
				height: 24px;
				border: 1px solid rgba(32, 36, 56, 0.2);
				border-radius: 50%;
				vertical-align: middle;
				font-size: 14px;
				line-height: 20px;
				background: transparent;
				font-weight: 300;
				opacity: 0.7;
				cursor: pointer;
				color: rgba(32, 36, 56, 0.2);
				transition: all 0.3s ease;
				&:hover {
					background:$mainColor;
					border-color: $mainColor;
					color:#fff;
					opacity: 1;
				}
			}
		}
		//Month
		&_m {
			transition: all 0.3s ease;
			//week
			&_w {
				font-size: 0;
				border-bottom: #ddd 1px solid;
				border-top: #ddd 1px solid;
				&_n {
					width: 40px;
					height: 40px;
					line-height: 40px;
					font-size: 14px;
					text-align: center;
					color: #888;
					display: inline-block;
					border-radius: 50%;
				}
			}
		}
	}
}
</style>

