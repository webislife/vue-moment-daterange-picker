<template>
    <div class="card">
        <div class="card-content">
            <span class="card-title">Single calendar</span>
            <p>
                <vue-calendar v-on:vdp-change="dateChange" :options="singleCalendar" />
            </p>
        </div>
        <div class="card-content">
            <span class="card-title">Range calendar</span>
            <p>
                <vue-calendar :options="rangeCalendar" />
            </p>
        </div>
    </div>
</template>

<script>
    import Calendar from './calendar.vue';
    import moment from 'moment';

    export default {
        name: "vue-app",
        data() {
            return {
                singleCalendar: {
                    startDate: null,
                    locale: "ru",
                    minDate: moment().subtract(5, "day"),
                    maxDate: moment().add(10, "day"),
                    format: 'DD MMMM'
                },
                rangeCalendar: {
                    type: "rangedate",
                    locale: "ru",
                    startDate: null,
                    endDate: null,
                    minDate: moment().subtract(1, "day"),
                    maxDate: moment().add(10, "day"),
                    format: 'DD MMMM'
                }
            }
        },
        components: {
            vueCalendar: Calendar
        },
        methods: {  
            dateChange: function (value) {
                console.log('date changed', value)
            }
        }
    }
</script>
<style lang="scss">
    body {
        background: #eee;
        min-width: 320px;
    }
    .card-content {
        background: #fff;
        border-radius: 4px;
        padding: 20px;
        margin-bottom: 20px;
    }
</style>
