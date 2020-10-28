import BigNumber from 'bignumber.js'

const CKB_UNIT = 100_000_000
const SUDT_UNIT = 10_000_000_000
const PRICE_UNIT = 10_000_000_000
export type RawOrder = Record<'is_bid' | 'claimable', boolean> &
  Record<'order_amount' | 'traded_amount' | 'turnover_rate' | 'paid_amount' | 'price', string> & {
    status: 'open' | 'completed' | 'aborted' | null
    last_order_cell_outpoint: Record<'tx_hash' | 'index', string>
  }

export const getAction = (isClaimed: boolean, isOpen: boolean) => {
  if (isClaimed) {
    return 'claim'
  }
  if (isOpen) {
    return 'open'
  }
  return null
}

/**
 * key: tx_hash:index
 */
export const parseOrderRecord = ({
  is_bid: isBid,
  order_amount,
  paid_amount,
  traded_amount,
  turnover_rate,
  price,
  claimable,
  status,
  last_order_cell_outpoint,
  ...rest
}: RawOrder) => {
  const key = `${last_order_cell_outpoint.tx_hash}:${last_order_cell_outpoint.index}`

  const paidAmount = new BigNumber(paid_amount).dividedBy(isBid ? CKB_UNIT : SUDT_UNIT)
  const orderAmount = new BigNumber(order_amount).dividedBy(isBid ? SUDT_UNIT : CKB_UNIT)
  const tradedAmount = new BigNumber(traded_amount).dividedBy(isBid ? SUDT_UNIT : CKB_UNIT)
  const priceInNum = new BigNumber(price).dividedBy(PRICE_UNIT)
  const payAmount = isBid ? orderAmount.dividedBy(priceInNum) : orderAmount.multipliedBy(priceInNum)

  return {
    key,
    pay: `${payAmount}`,
    paidAmount: `${paidAmount}`,
    tradedAmount: `${tradedAmount}`,
    isBid,
    receive: `${orderAmount}`,
    executed: `${new BigNumber(turnover_rate).multipliedBy(100)}%`,
    price: `${priceInNum}`,
    status,
    action: getAction(claimable, status === 'open'),
    ...rest,
  }
}
export type OrderRecord = ReturnType<typeof parseOrderRecord>
export type OrderRecordAction = ReturnType<typeof getAction>

export default { parseOrderRecord }
