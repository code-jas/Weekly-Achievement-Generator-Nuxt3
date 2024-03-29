<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs';


//DATA
const state = reactive({ 
    // data
    user: {},
    accomplishmentReports: [],
    
    //events
    dateRange: [],
    showModal: false,
    fetchLoading: false,
    downloadLoading: false,
    // ui
    size: 'default',
})

const columns = [
    {title: "Date", dataIndex: "date", key: "date", width: 110},
    {title: "Descriptions", dataIndex: "description", key: "description"},
    {title: "Start Time", dataIndex: "startTime", key: "startTime", width: 130, ellipsis: true,},
    {title: "End Time", dataIndex: "endTime", key: "endTime", width: 130, ellipsis: true,},
    {title: "Duration", dataIndex: "formattedDuration", key: "duration", width: 150, ellipsis: true, },
]
    


//METHODS
const dateRangeOnChange = (dates) => {
    if(dates[0] && dates[1]){ 
        state.dateRange = dates
        loadAchievementReports(state.user, dates)
    } else { 
        state.dateRange = []
        loadAchievementReports(state.user)
    }
}

// ASYNC METHODS
const loadAchievementReports = async(userDetails, dateRange) =>  { 
    try {
        state.fetchLoading = true;
        let payload  = { ...userDetails}
        if (dateRange)  payload = { ...userDetails, dateRange }
        
        const {data}  = await useFetch(`/api/clockify/time-entries`, {
            method: 'post',
            body: payload
        })
        state.accomplishmentReports = data.value
    } catch (error) {
        console.log("loadAchievementReports Error :>>" , error)
    } finally { 
        state.fetchLoading = false;
    }

}
const generateWar = async() =>  { 
    try {
        state.downloadLoading = true;
        const dateRange = JSON.parse(JSON.stringify(state.dateRange))

        if(dateRange.length <= 0) return console.log('ERROR!!! Please select date range');
        const formattedPeriodCovered = `${dayjs(dateRange[0]).format('MMMM DD YYYY')} - ${dayjs(dateRange[1]).format('MMMM DD YYYY')}`;
        const payload = { 
            ...state.user,
            periodCovered: formattedPeriodCovered,
            accomplishmentReports: state.accomplishmentReports
        }
        // console.log('payload :>> ', payload);

        const res  = await useFetch(`/api/clockify/generate-war`, {
            method: 'post', body: payload
        })
        let a = document.createElement("a");
        if (res.data.value) {
            a.href = "data:image/png;base64," + res.data.value;
            a.download = `${state.user.name}-${formattedPeriodCovered}-weekly-accomplishment-report.xlsx`;
            // a.download = `heello-weekly-achievement-report.xlsx`;
            a.click();
        }
    } catch (error) {
        console.log('error :>> ', error);
    } finally { 
        state.downloadLoading = false
    }
}

const fetchData = () =>  {
    const user = useCookie('user').value
    state.user = user ? JSON.parse(useTokenUtils().decryptData(user)) : null
    // console.log('state.user :>> ', state.user);
    state.user  ?   loadAchievementReports(state.user) : state.showModal = true
}

fetchData()
</script>


<template>
<div class="bg-home">
    <div style="margin: 40px" >
        <a-row type="flex" justify="start" align="top" :gutter="[30, 20]">
            <a-col :span="12" justify="center" align="left">
                <a-range-picker @change="dateRangeOnChange" :size="state.size" style="width:400px;" />
            </a-col>
            <a-col :span="12" type="flex" justify="center" align="right">
                <a-button type="primary" :size="state.size" @click="state.showModal = true" style="margin-right: 12px;">
                    Input Details
                </a-button>
                <a-tooltip title="Download Weekly Accomplishment Reports" > 
                    <a-button type="primary" :size="state.size" :loading="state.downloadLoading" @click="generateWar">
                        <CommonIcon type="DownloadOutlined" /> Download
                    </a-button>
                </a-tooltip>
            </a-col>
            <a-col :span="10" v-if="state.user" >
                    <a-descriptions :column="1" title="User Details" size="small" bordered>
                    <a-descriptions-item label="Name">{{ state.user.name }}</a-descriptions-item>
                    <a-descriptions-item label="Position">{{ state.user.position }}</a-descriptions-item>
                </a-descriptions>
            </a-col>

            <a-col :span="24" >
                <!-- <pre>{{ state.accomplishmentReports }}</pre> -->
                <a-spin tip="Loading..." class="center-loading" :spinning="state.fetchLoading">
                    <div v-if="state.user">
                        <a-table 
                            :columns="columns" 
                            :data-source="state.accomplishmentReports" 
                            bordered 
                            size="small" 
                            :pagination="{ pageSize: 30 }" 
                            :scroll="{ x: 1000}"
                            
                        >
                            <template #bodyCell="{column, text, record}">
                                <template v-if="column.dataIndex === 'formattedDuration'">
                                    {{ record.formattedTotalDurationPerDay  ? record.formattedTotalDurationPerDay : text }}
                                </template>
                            </template>
                        </a-table>
                    </div>
                    <div v-else class="center-loading">
                        <h1 style="color: #fff; text-align: center; margin: 5rem;">PLEASE INPUT YOUR DETAILS FIRST</h1>
                    </div>
                </a-spin>
            </a-col>
            

        </a-row>
        <InputModal :open="state.showModal" @close="state.showModal = false"  @reload="fetchData"/>
    </div>
</div>
</template>


<style>
.bg-home{ 
  display:flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  background-image: url('~/assets/bg.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
</style>