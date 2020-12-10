import React, { useMemo } from 'react'
import { Divider } from 'antd'
import { Builder } from '@lay2/pw-core'
import { toFormatWithoutTrailingZero } from 'utils/fee'
import i18n from 'utils/i18n'
import { useContainer } from 'unstated-next'
import OrderContainer from 'containers/order'
import { List, Item } from './list'
import { OrderResult } from './styled'

const CrossChain = () => {
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair

  const pay = useMemo(() => {
    return toFormatWithoutTrailingZero(Order.pay)
  }, [Order.pay])

  const receive = useMemo(() => {
    return toFormatWithoutTrailingZero(Order.pay)
  }, [Order.pay])

  const transactionFee = useMemo(() => {
    return Order.tx ? Builder.calcFee(Order.tx).toString() : '0'
  }, [Order.tx])

  const totalPayDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.totalPay`),
        value: pay,
        unit: buyer,
      },
      {
        desc: '',
        value: transactionFee,
        unit: 'CKB',
      },
    ]

    return list
  }, [pay, buyer, transactionFee])

  const tradeDetails = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t('trade.result.crossChain'),
        value: toFormatWithoutTrailingZero(pay),
        unit: buyer,
      },
      {
        desc: i18n.t('trade.result.crossFee'),
        value: i18n.t('trade.result.freeNow'),
        unit: 'free-now',
      },
      {
        desc: i18n.t('trade.result.transactionFee'),
        value: transactionFee,
        unit: 'CKB',
      },
    ]
    return list
  }, [buyer, pay, transactionFee])

  const receiveDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.result.receive`),
        value: receive,
        unit: seller,
      },
    ]

    return list
  }, [receive, seller])

  return (
    <OrderResult>
      <List list={totalPayDetail} />
      <List list={tradeDetails} isDeatil />
      <Divider style={{ margin: '20px 0' }} />
      <List list={receiveDetail} />
    </OrderResult>
  )
}

export default CrossChain
