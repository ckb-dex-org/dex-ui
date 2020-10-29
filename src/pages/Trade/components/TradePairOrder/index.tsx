import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Form, Input, Button, Tooltip, Divider, Popover } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { useContainer } from 'unstated-next'
import { PairList } from '../../../../utils/const'
import TradeCoinBox from '../TradeCoinBox'
import i18n from '../../../../utils/i18n'
import TracePairCoin from '../TracePairCoin'
import { PairOrderFormBox, PayMeta, OrderSelectBox, OrderSelectPopver, PairBlock } from './styled'
import OrderContainer, { OrderStep } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'

export default () => {
  const [form] = Form.useForm()
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const [visiblePopver, setVisiblePopver] = useState(false)
  const { price, setPrice: priceOnChange, pay, setPay: payOnChange, receive, setStep } = Order
  const formRef = React.createRef<FormInstance>()
  const [buyer, seller] = Order.pair

  const changePair = () => {
    setVisiblePopver(false)
    Order.togglePair()
    form.resetFields()
  }

  const walletNotConnected = useMemo(() => {
    return !Wallet.ckbWallet.address
  }, [Wallet.ckbWallet.address])

  const setBestPrice = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    formRef.current?.setFieldsValue({
      price: Order.bestPrice,
    })
    priceOnChange(Order.bestPrice)
  }, [Order.bestPrice, formRef, priceOnChange])

  const submitStatus = useMemo(() => {
    if (Wallet.connecting) {
      return i18n.t('header.connecting')
    }

    if (walletNotConnected) {
      return i18n.t('header.wallet')
    }

    return i18n.t('trade.placeOrder')
  }, [Wallet.connecting, walletNotConnected])

  useEffect(() => {
    if (Wallet.ckbWallet.address === '') {
      return
    }

    Order.initPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Wallet.ckbWallet.address])

  useEffect(() => {
    Order.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Order.step])

  const onSubmit = useCallback(() => {
    if (walletNotConnected) {
      Wallet.connectWallet()
    } else {
      setStep(OrderStep.Comfirm)
    }
  }, [setStep, walletNotConnected, Wallet.connectWallet])

  const SelectContent = (
    <OrderSelectPopver>
      <Input
        style={{
          flex: 'auto',
          fontSize: '16px',
          background: 'rgba(236, 242, 244, 1)',
        }}
        placeholder={i18n.t('trade.searchPairPlaceHolder')}
      />
      <Divider
        style={{
          background: '#ABD1E1',
        }}
      />
      {PairList.slice(1).map(item => (
        <PairBlock key={item.name} onClick={() => changePair()}>
          <Button className="pairTraceList" type="text">
            <TradeCoinBox pair={item.name} />
            <div className="decollect">/</div>
            <TradeCoinBox pair="CKB" />
          </Button>
        </PairBlock>
      ))}
    </OrderSelectPopver>
  )

  return (
    <PairOrderFormBox id="order-box">
      <Popover
        overlayClassName="no-arrorPoint popver-overlay"
        trigger="click"
        visible={visiblePopver}
        getPopupContainer={() => document.getElementById('order-box') as HTMLElement}
        content={SelectContent}
        onVisibleChange={(visible: boolean) => setVisiblePopver(visible)}
      >
        <OrderSelectBox id="trace-form-select">
          <PairBlock>
            <span className="pair">{i18n.t('trade.pair')}</span>
            <Button className="pairTraceList" type="text">
              <TradeCoinBox pair={Order.pair[0]} />
              <div className="decollect">/</div>
              <TradeCoinBox pair={Order.pair[1]} />
            </Button>
          </PairBlock>
        </OrderSelectBox>
      </Popover>
      <TracePairCoin />
      <Form form={form} ref={formRef} autoComplete="off" name="traceForm" layout="vertical" onFinish={onSubmit}>
        <Form.Item label={i18n.t('trade.pay')}>
          <PayMeta>
            <span className="form-label-meta-num">{`${i18n.t('trade.max')}: ${Order.maxPay}`}</span>
            <Tooltip title={i18n.t('trade.maxPay')}>
              <i className="ai-question-circle-o" />
            </Tooltip>
          </PayMeta>
          <Form.Item
            name="pay"
            noStyle
            // rules={[
            //   {
            //     validator: checkPay,
            //   },
            // ]}
          >
            <Input
              placeholder="0"
              suffix={buyer}
              type="number"
              required
              style={{
                color: 'rgba(81, 119, 136, 1)',
                width: '100%',
              }}
              step="any"
              value={pay}
              onChange={e => {
                payOnChange(e.target.value)
              }}
              max={Order.maxPay}
              min={0.0000001}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item label={i18n.t('trade.price')} className="price-box">
          <PayMeta>
            <Button type="text" className="form-label-meta-num" onClick={setBestPrice}>
              {`${i18n.t('trade.suggestion')}: ${Order.bestPrice}`}
            </Button>
            <Tooltip title={i18n.t(`trade.suggestionTooltip`)}>
              <i className="ai-question-circle-o" />
            </Tooltip>
          </PayMeta>
          <Form.Item
            name="price"
            // rules={[
            //   {
            //     validator: checkPrice,
            //   },
            // ]}
          >
            <Input
              placeholder="0"
              suffix="CKB per DAI"
              style={{
                color: 'rgba(81, 119, 136, 1)',
              }}
              required
              type="number"
              step="any"
              value={price}
              onChange={e => {
                priceOnChange(e.target.value)
              }}
              min={0.0000000001}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="caret-down"
          style={{
            textAlign: 'center',
            margin: 0,
            color: '#517788',
          }}
        >
          <i className="ai-caret-down" />
        </Form.Item>
        <Form.Item
          label={i18n.t('trade.receive')}
          name="receiver"
          style={{
            marginBottom: '10px',
          }}
        >
          <div className="receiver-box">
            <span className="receiver-ckb">{receive}</span>
            <span>{seller}</span>
          </div>
        </Form.Item>
        <div className="dividing-line" />
        <Form.Item className="submit-item">
          <Button htmlType="submit" className="submitBtn" disabled={Wallet.connecting} size="large" type="text">
            {submitStatus}
          </Button>
        </Form.Item>
      </Form>
    </PairOrderFormBox>
  )
}
