import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'

import ContentHeader from '../../Components/ContentHeader'
import SelectInput from '../../Components/SelectInput'
import WalletBox from '../../Components/WalletBox'
import MessageBox from '../../Components/MessageBox'
import PieChartComponent from '../../Components/PieChartComponent'
import HistoryBox from '../../Components/HistoryBox'
import BarChartBox from '../../Components/BarChartBox'
import Spinner from '../../Components/Spinner'


import happyImg from '../../Assets/happy.svg'
import sadImg from '../../Assets/sad.svg'
import grinningImg from '../../Assets/grinning.svg'
import opsImg from '../../Assets/ops.svg'

import AxiosWithToken from '../../Services/AxiosWithToken'

import ListMonth from '../../utils/ListMonth'

import { Content } from './styled'


interface IData {
    description: string;
    amount: string;
    frequency: string;
    date: string;
    month: number;
    year: number;
    type: string;
}


const Dashboard: React.FC = () => {


    const [filter, setFilter] = useState<object>({})
    const [filteredData, setFilteredData] = useState<IData[]>([])
    const [data, setData] = useState<IData[]>([])
    const [selectedYear, setSelectedYear] = useState<number | string>("todos")
    const [loading, setLoading] = useState<boolean>(false)

    const onFetchData = useCallback(async () => {
        try {
            setLoading(true)
            const res = await AxiosWithToken.get('history-card')
            setData(res.data)
            setLoading(false)
        } catch (error) {
            console.log(error)
            toast.error('Algo aconteceu de errado, tente novamente!')
            setLoading(false)
        }
    }, [])

    const onTakeYears = useMemo(() => {
        const years: number[] = []
        const realyears: any[] = [{ value: "todos", label: "Todos" }]
        data.map(item => {
            const itemYear = new Date(item.date).getFullYear()
            if (!years.includes(itemYear)) years.push(itemYear)
            return null
        })

        years.map(item => {
            return realyears.push({ label: item, value: item })
        })

        return realyears
    }, [data])

    const onTakeMonths = useMemo(() => {
        const realMonths: any[] = [{ value: "todos", label: "Todos" }]
        ListMonth.map((item, idx) => {
            return realMonths.push({ value: idx + 1, label: item })
        })

        return realMonths
    }, [])

    const totalExpenses = useMemo(() => {
        let total: number = 0

        filteredData?.map(item => {
            if (item.type === 'expenses') total += Number(item.amount)
            return null
        })

        return total

    }, [filteredData])

    const totalGains = useMemo(() => {
        let total: number = 0

        filteredData.map(item => {
            if (item.type === 'gains') total += Number(item.amount)
            return null
        })

        return total

    }, [filteredData])

    const totalRest = useMemo(() => {
        let total: number = totalGains - totalExpenses
        return total
    }, [totalExpenses, totalGains])

    const MessageCard = useMemo(() => {
        if (totalRest > 0) {
            return {
                title: "Muito bem!",
                description: "Sua carteira está positiva!",
                footerText: "Continue assim. Considere investir o seu saldo.",
                icon: happyImg
            }
        } else if (totalGains === 0 && totalExpenses === 0) {
            return {
                title: "Ops!",
                description: "Neste mês, não há registros de entradas ou saídas.",
                footerText: "Parece que você não fez nenhum registro no mês e ano selecionado.",
                icon: opsImg
            }
        } else if (totalRest === 0) {
            return {
                title: "Ufaa!",
                description: "Neste mês, você gastou exatamente o que ganhou.",
                footerText: "Tenha cuidado. No próximo tente poupar o seu dinheiro.",
                icon: grinningImg
            }
        } else {
            return {
                title: "Que Triste!",
                description: "Neste mês, você gastou mais do que deveria.",
                footerText: "Verifique seus gastos e tente cortar algumas coisas desnecessárias.",
                icon: sadImg
            }
        }

    }, [totalRest, totalExpenses, totalGains])

    const historyData = useMemo(() => {
        return ListMonth.map((_, indx) => {
            let amountEntry = 0;
            filteredData.filter(item => item.type === 'gains').forEach(gain => {
                const gainsDate = new Date(gain.date)
                const gainMonth = gainsDate.getMonth()
                const gainYear = gainsDate.getFullYear()

                if (selectedYear === "todos") {
                    if (gainMonth === indx) {
                        amountEntry += Number(gain.amount)
                    }
                } else {
                    if (gainMonth === indx && gainYear === Number(selectedYear)) {
                        amountEntry += Number(gain.amount)
                    }
                }
            })

            let amountOutput = 0;
            filteredData.filter(item => item.type === 'expenses').forEach(expense => {
                const expensesDate = new Date(expense.date)
                const expenseMonth = expensesDate.getMonth()
                const expenseyear = expensesDate.getFullYear()

                if (selectedYear === "todos") {
                    if (expenseMonth === indx) {
                        amountOutput += Number(expense.amount)
                    }
                } else {
                    if (expenseMonth === indx && expenseyear === Number(selectedYear)) {
                        amountOutput += Number(expense.amount)
                    }
                }

            })

            return {
                monthNumber: indx,
                month: ListMonth[indx].substr(0, 3),
                amountEntry,
                amountOutput
            }
        }).filter(item => {
            const currentMonth = new Date().getMonth()

            return (item.monthNumber <= currentMonth)
        })
    }, [filteredData, selectedYear])


    const relationExpensesVersusGains = useMemo(() => {
        const total = totalGains + totalExpenses
        const percentGains = (totalGains / total) * 100 || 0
        const percentExpenses = (totalExpenses / total) * 100 || 0

        return {
            data: [
                {
                    name: "Entradas",
                    value: Number(total.toFixed(0)),
                    percent: Number(percentGains.toFixed(0)),
                    color: "#e44c4e"
                },
                {
                    name: "Saídas",
                    value: Number(total.toFixed(0)),
                    percent: Number(percentExpenses.toFixed(0)),
                    color: "#f7931b"
                }
            ],
            legendData: [
                {
                    labelText: "Entradas",
                    boxText: `${percentGains.toFixed(0)}%`,
                    color: "#e44c4e"
                },
                {
                    labelText: "Saídas",
                    boxText: `${percentExpenses.toFixed(0)}%`,
                    color: "#f7931b"
                }
            ]
        }
    }, [totalExpenses, totalGains])

    const relationsGains = useMemo(() => {
        let total = 0;
        let amountRecorrent = 0;
        let amountEventual = 0;

        filteredData?.map(item => {
            if (item.type === 'gains') {
                total = total + Number(item.amount)
                if (item.frequency === "recurrent") {
                    amountRecorrent = amountRecorrent + Number(item.amount)
                } else {
                    amountEventual = amountEventual + Number(item.amount)
                }
            }
            return null
        })

        let recorrentPercent = (amountRecorrent / total) * 100 || 0
        let eventualPercent = (amountEventual / total) * 100 || 0

        return {
            data: [
                {
                    name: "Recorrentes",
                    amount: amountRecorrent,
                    percent: recorrentPercent,
                    color: "#F7931B"
                },
                {
                    name: "Eventuais",
                    amount: amountEventual,
                    percent: eventualPercent,
                    color: "#E44C4E"
                }
            ],
            legendData: [
                {
                    labelText: "Recorrentes",
                    boxText: `${recorrentPercent.toFixed(0)}%`,
                    color: "#F7931B"
                },
                {
                    labelText: "Eventuais",
                    boxText: `${eventualPercent.toFixed(0)}%`,
                    color: "#E44C4E"
                }
            ]
        }
    }, [filteredData])

    const relationsExpenses = useMemo(() => {
        let total = 0;
        let amountRecorrent = 0;
        let amountEventual = 0;

        filteredData?.map(item => {
            if (item.type === 'expenses') {
                total = total + Number(item.amount)
                if (item.frequency === "recurrent") {
                    amountRecorrent = amountRecorrent + Number(item.amount)
                } else {
                    amountEventual = amountEventual + Number(item.amount)
                }
            }
            return null
        })

        let recorrentPercent = (amountRecorrent / total) * 100 || 0
        let eventualPercent = (amountEventual / total) * 100 || 0

        return {
            data: [
                {
                    name: "Recorrentes",
                    amount: amountRecorrent,
                    percent: recorrentPercent,
                    color: "#F7931B"
                },
                {
                    name: "Eventuais",
                    amount: amountEventual,
                    percent: eventualPercent,
                    color: "#E44C4E"
                }
            ],
            legendData: [
                {
                    labelText: "Recorrentes",
                    boxText: `${recorrentPercent.toFixed(0)}%`,
                    color: "#F7931B"
                },
                {
                    labelText: "Eventuais",
                    boxText: `${eventualPercent.toFixed(0)}%`,
                    color: "#E44C4E"
                }
            ]
        }
    }, [filteredData])


    useEffect(() => {
        setFilteredData(Object.entries(filter).reduce((item, [field, value]) => {
            return item.filter(objto => {
                if (value === 'todos') {
                    return data
                } else if (field === 'month') {
                    const objtMonth = new Date(new Date(objto.date).setDate(new Date(objto.date).getDate() + 1)).getMonth() + 1
                    return objtMonth === +value 
                } else if (field === 'year') {
                    const objtYear = new Date(objto.date).getFullYear()
                    return objtYear === +value
                }
                return null
            })
        }, data)
        )
    }, [filter, data])

    useEffect(() => {
        onFetchData()

        return () => setData([])
    }, [onFetchData])


    return (
        <>
            <ContentHeader title="Dashboard" lineColor="#f7931b">
                <SelectInput options={onTakeMonths} setValue={(e) => setFilter({ ...filter, 'month': e.target.value })} defaultValue="todos" />
                <SelectInput options={onTakeYears} setValue={(e) => { setFilter({ ...filter, 'year': e.target.value }); setSelectedYear(e.target.value) }} defaultValue="todos" />
            </ContentHeader>
            <Content>
                {
                    loading

                        ?
                        <Spinner />

                        :
                        <>
                            <WalletBox title="Saldo" amount={totalRest} footerLabel="Atualizado com base nas entradas e saídas" icon="dolar" color="#4e41f0" />
                            <WalletBox title="Entradas" amount={totalGains} footerLabel="Atualizado com base nas entradas e saídas" icon="arrowUp" color="#f7931b" />
                            <WalletBox title="Saídas" amount={totalExpenses} footerLabel="Atualizado com base nas entradas e saídas" icon="arrowDown" color="#e44c4e" />
                            <MessageBox title={MessageCard.title} description={MessageCard.description} footerText={MessageCard.footerText} icon={MessageCard.icon} />
                            <PieChartComponent data={relationExpensesVersusGains.data} dataLegend={relationExpensesVersusGains.legendData} />
                            <HistoryBox data={historyData} lineColorAmountEntry="#f7931b" lineColorAmountOutput="#e44c4e" />
                            <BarChartBox title="Saídas" data={relationsExpenses.data} legendData={relationsExpenses.legendData} />
                            <BarChartBox title="Entradas" data={relationsGains.data} legendData={relationsGains.legendData} />
                        </>
                }
            </Content>
        </ >
    )
}

export default Dashboard