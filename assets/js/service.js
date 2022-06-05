
const baseUrl = "https://api.covid19api.com"

const service = axios.create({
   baseURL: baseUrl
})

async function getSummary() {
   try {
      const url = `/summary`
      console.log(`GET ${baseUrl}${url}`);
      const res = await service.get(url);
      return res?.data
   } catch {
      console.error(err)
      throw err
   }
}

async function getCountries() {
   try {
      const url = `/countries`
      console.log(`GET ${baseUrl}${url}`);
      const res = await service.get(url);
      return res?.data
   } catch {
      console.error(err)
      throw err
   }
}

async function byCountryAllStatus(country, from, to) {
   let params = []
   if (from || to) {
      if (from)
         params.push(`from=${from}T00:00:00Z`)
      if (to)
         params.push(`to=${to}T00:00:00Z`)
   }
   const url = `/country/${country}${params.length > 0 ? '?' + params.join("&") : ''}`
   console.log(`GET ${baseUrl}${url}`);
   const res = await service.get(url)
   return res.data
}

async function byCountryTotalAllStatus(country, from, to) {
   let params = []
   if (from || to) {
      if (from)
         params.push(`from=${from}T00:00:00Z`)
      if (to)
         params.push(`to=${to}T00:00:00Z`)
   }
   const url = `/total/country/${country}${params ? '?' + params.join("&") : ''}`
   console.log(`GET ${baseUrl}${url}`);
   const res = await service.get(url)
   return res.data
}

export { getSummary, getCountries, byCountryAllStatus, byCountryTotalAllStatus }

