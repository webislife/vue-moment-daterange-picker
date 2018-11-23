# Vue moment date range picker
Simple vie date range picker. Work with moment.js
[See demo](http://webislife.ru/vuedaterangepicker/demo.html)

### Supports
- :pushpin: single and range date mode
- :pushpin: multi locales
- :pushpin: min and max dates
- :pushpin: Easy to customize and styling

### Available params
    {
        type: 'date', // || rangedate
        startDate: moment(), //startDate moment() || null
        endDate: moment(), //endDate moment() || null
        locale: 'ru',
        format: 'YYYY.MM.DD', //Display date format
        minDate: null, //min date
        maxDate: null, //max date
        placeholderStart: '',
        placeholderEnd: '',
        firstDayOfWeek: moment.localeData().firstDayOfWeek()
    }

### Example init
```
<vue-calendar v-on:vdp-show="onShow" v-on:vdp-hide="onHide" v-on:vdp-change="onDateChange" :options="singleCalendar" />
```
in parent component
```
data() {
    return {
        singleCalendar: {
            startDate: null,
            locale: "ru",
            minDate: moment().subtract(5, "day"),
            maxDate: moment().add(10, "day"),
            format: 'DD MMMM'
        }
    }
}
```
