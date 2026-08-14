/**
 * Vercel serverless function — /api/shop?shop_id=<id>
 *
 * Queries etsy-data-warehouse-prod.rollups.seller_basics and returns
 * a trimmed shop object for the listing-create prototype.
 *
 * Auth: set GOOGLE_APPLICATION_CREDENTIALS_JSON in Vercel env vars
 * to the full contents of a service-account key JSON.
 * Locally, ADC is used automatically when the env var is absent.
 */

import { BigQuery } from '@google-cloud/bigquery'

export default async function handler(req, res) {
  const { shop_id } = req.query

  if (!shop_id || !/^\d+$/.test(shop_id)) {
    return res.status(400).json({ error: 'shop_id must be a numeric string' })
  }

  let credentials
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    } catch {
      return res.status(500).json({ error: 'Malformed GOOGLE_APPLICATION_CREDENTIALS_JSON' })
    }
  }

  const bq = new BigQuery({
    projectId: 'etsy-bq-interactive-prod',
    ...(credentials ? { credentials } : {}),
  })

  const query = `
    SELECT
      shop_id,
      shop_name,
      active_listings,
      usa_zip,
      intl_zip,
      country_name,
      usa_city,
      usa_state,
      seller_tier_new,
      seller_segment,
      total_orders,
      ROUND(past_year_gms / 100, 2) AS past_year_gms_usd,
      open_date,
      first_sale_date
    FROM \`etsy-data-warehouse-prod.rollups.seller_basics\`
    WHERE shop_id = @shop_id
    LIMIT 1
  `

  try {
    const [rows] = await bq.query({
      query,
      params: { shop_id: parseInt(shop_id, 10) },
      types: { shop_id: 'INT64' },
      location: 'US',
    })

    if (!rows.length) {
      return res.status(404).json({ error: `No shop found for shop_id ${shop_id}` })
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    return res.status(200).json(rows[0])
  } catch (err) {
    console.error('BigQuery error:', err)
    return res.status(500).json({ error: 'Failed to query shop data' })
  }
}
