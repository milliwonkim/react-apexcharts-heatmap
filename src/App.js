import React, { useState, useEffect, useRef } from 'react'
import ReactApexCharts from 'react-apexcharts'
import axios from 'axios'
import { CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import './App.css'

function App() {
    const [changeParams, setChangeParams] = useState('retention')
    const [state, setState] = useState({
        series: [],
        options: {},
    })

    const [loading, setLoading] = useState(true)

    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
            justify: 'center',
            alignItems: 'center',
        },
    }))

    const classes = useStyles()

    useEffect(() => {
        axios({
            method: 'GET',
            url:
                'https://nmsvtx50zd.execute-api.ap-northeast-2.amazonaws.com/beta/cohort/repurchase',
            params: {
                freq: 'monthly',
                dimensions: 'm',
                measures: changeParams,
            },
        }).then((data) => {
            setLoading(false)
            console.log(data)

            let newMeasures = []

            data.data.index = data.data.index.reverse()
            data.data.data.measures[0] = data.data.data.measures[0].reverse()

            for (let i = 0; i < data.data.data.dimensions.length; i++) {
                let subDimensions = []
                for (let j = 1; j < data.data.data.dimensions.length; j++) {
                    if (data.data.data.measures[0][i][j] === null) {
                        data.data.data.measures[0][i][j] = 0
                    }

                    subDimensions.push(data.data.data.measures[0][i][j])
                }
                let object = {
                    name: data.data.index[i],
                    data: subDimensions,
                }

                newMeasures.push(object)
            }

            let newDimensions = []

            for (let i = 1; i < data.data.data.dimensions.length; i++) {
                newDimensions.push(data.data.data.dimensions[i])
            }

            setState({
                series: newMeasures,
                options: {
                    chart: {
                        width: '100%',
                        height: '700',
                        type: 'heatmap',
                    },
                    xaxis: {
                        categories: newDimensions,
                        tooltip: {
                            enabled: true,
                            formatter: function (val, opts) {
                                return val + '일 +'
                            },
                        },
                        position: 'top',
                    },
                    yaxis: {
                        show: true,
                    },
                    dataLabels: {
                        enabled: true,
                        formatter: function (val, opts) {
                            if (changeParams === 'retention') {
                                return val + '%'
                            } else {
                                return val + '명'
                            }
                        },
                    },
                    colors: ['#008FFB'],
                    title: {
                        text:
                            changeParams === 'retention'
                                ? 'Retention'
                                : changeParams === 'user_cnt'
                                ? 'User Count'
                                : 'Cohort User Count',
                    },
                    tooltip: {
                        x: {
                            show: true,
                            formatter: function (val, opts) {
                                return '경과일 수: ' + val + '일'
                            },
                        },
                        y: {
                            show: true,
                            formatter: function (val, opts) {
                                if (changeParams === 'retention') {
                                    return val + '%'
                                } else {
                                    return val + '명'
                                }
                            },
                        },
                    },
                },
            })
        })
    }, [changeParams])

    const handleChange = (e) => {
        setChangeParams(e.target.value)
    }

    return (
        <div className="App">
            {loading ? (
                <CircularProgress className={classes.root} />
            ) : (
                <div>
                    <select onChange={handleChange}>
                        <option value="retention">Retention</option>
                        <option value="cohort_user_cnt">
                            Cohort User Count
                        </option>
                        <option value="user_cnt">User Count</option>
                    </select>
                    <ReactApexCharts
                        options={state.options}
                        series={state.series}
                        type="heatmap"
                        width="1200"
                    />
                </div>
            )}
        </div>
    )
}

export default App
