import { 
   getCountries, 
   byCountryAllStatus
} from './service.js'

const startDateE = document.getElementById('start-date')
const endDateE = document.getElementById('end-date')
const cmbCountriesE = document.getElementById('cmbCountry')
const cmbDataE = document.getElementById('cmbData')
const dailyCurveGraphE = document.getElementById('daily-curve-graph')
const kpiConfirmedE = document.getElementById('kpiconfirmed')
const kpiDeathsE = document.getElementById('kpideaths')
const kpiRecoveredE = document.getElementById('kpirecovered')
const btnApply = document.getElementById('btn-apply')
let dailyCurveGraph;

async function init() {
   const countries = await getCountries();

   btnApply.addEventListener("click", renderData)

   renderCountriesSelect(countries)
   renderData()
}
init()

function renderCountriesSelect(countries) {
   countries = countries.sort((a, b) => a.Country.localeCompare(b.Country));

   for (const c of countries) {
      const option = document.createElement("option");
      option.textContent = c.Country;
      option.value = c.Slug;
      option.selected = (c.ISO2 === "BR");
      cmbCountriesE.appendChild(option);
    }
}

async function renderData(evt) {
   if (evt) {
      evt.preventDefault()
      evt.stopPropagation()
   }

   let startDate = startDateE.value
   let endDate = endDateE.value
   validateDates(startDate, endDate)

   if (startDate) {
      let dt = dateFns.parse(startDate, "yyyy-MM-dd")
      startDate = dateFns.subDays(dt, 1)
      startDate = dateFns.format(startDate, "YYYY-MM-DD", {locale: dateFns.en})
   }
   const countryValue = cmbCountriesE.value
   const dataValue = cmbDataE.value

   let byCountryData
   try {
      byCountryData = await byCountryAllStatus(countryValue, startDate, endDate)
   } catch (err) {
      console.error(err?.response?.data?.message)
      Swal.fire({
         title: 'Error!',
         text: err?.response?.data?.message,
         icon: 'error',
         confirmButtonText: 'Ok'
       })
      throw new Error(err?.response?.data?.message)
   }

   let previous = byCountryData[0];
   if (previous.Province) {
      byCountryData = groupBy(byCountryData)

   } else if (!startDate) {
      previous.ConfirmedDayCases = previous.Confirmed
      previous.DeathsDayCases = previous.Deaths
      previous.RecoveredDayCases = previous.Recovered
   }
   let totalConfirmed = 0
   let totalDeaths = 0
   let totalRecovered = 0
   for (let idx = 1; idx < byCountryData.length; ++idx) {
      const current = byCountryData[idx]
      if (current.Province) {
         current.ConfirmedDayCases = current.Confirmed
         current.DeathsDayCases = current.Deaths
         current.RecoveredDayCases = current.Recovered
      } else {
         if (current.Recovered == 0) {
            current.RecoveredDayCases = 0
         } else {
            current.RecoveredDayCases = current.Recovered - previous.Recovered
         }
         current.ConfirmedDayCases = current.Confirmed - previous.Confirmed
         current.DeathsDayCases = current.Deaths - previous.Deaths
      }
      totalConfirmed += current.ConfirmedDayCases
      totalDeaths += current.DeathsDayCases
      totalRecovered += current.RecoveredDayCases

      let totalByDay = eval(`total${dataValue.charAt(0).toUpperCase() + dataValue.slice(1)}`).toFixed(2)
      let averageByDay = (totalByDay / idx).toFixed(2)
      current.Average = averageByDay
      byCountryData[idx] = current
      previous = current
   }

   kpiConfirmedE.textContent = totalConfirmed
   kpiDeathsE.textContent = totalDeaths
   kpiRecoveredE.textContent = totalRecovered

   if (startDate) {
      byCountryData = byCountryData.slice(1)
   }
   renderLineGraph(dataValue, byCountryData)
}

function renderLineGraph(dataValue, byCountryData) {
   const labels = byCountryData.map(e => dateFns.format(e.Date.substring(0, e.Date.indexOf('T')), "DD-MM-YYYY"))
   const dataByDay = byCountryData.map(e => e[dataValue.charAt(0).toUpperCase() + dataValue.slice(1) + "DayCases"])
   const averageData = byCountryData.map(e => e.Average)

   if (dailyCurveGraph) {
      dailyCurveGraph.destroy()
   }

   dailyCurveGraph = new Chart(dailyCurveGraphE, {
      type: 'line',
      data: {
         labels: labels,
         datasets: [
            {
               label: cmbDataE.options[cmbDataE.selectedIndex].text,
               data: dataByDay,
               borderColor: "#e82020",
               backgroundColor: ["#e82020"],
            },
            {
               label: 'Average ' + cmbDataE.options[cmbDataE.selectedIndex].text,
               data: averageData,
               borderColor: "#32a852",
               backgroundColor: ["#32a852"]
            }
         ]
      },
      options: {
         responsive: true,
         plugins: {
            legend: {
               position: 'top'
            },
            title: {
               display: true,
               fullSize: true,
               font: {
                  size: 26
               },
               text: 'Distribution of New Cases'
            }
         }
      }
   })
}

var groupBy = function(array) {
   let result = []
   array.reduce((res, value) => {
      if (!res[value.Date]) {
         res[value.Date] = { "Date": value.Date, "Confirmed": 0, "Deaths": 0, "Recovered": 0, ...value }
         result.push(res[value.Date])
      }
      res[value.Date].Confirmed += value.Confirmed
      res[value.Date].Deaths += value.Deaths
      res[value.Date].Recovered += value.Recovered
      return res
   }, {})
   return result
 }

 function validateDates(startDate, endDate) {
   if (startDate || endDate) {
      if ((startDate && !endDate) || (!startDate && endDate)) {
         const msg = 'Only start date or only end date ara not allowed'
         Swal.fire({
            title: 'Error!',
            text: msg,
            icon: 'error',
            confirmButtonText: 'Ok'
         })
         throw new Error(msg)
      }
      if (startDate > endDate) {
         const msg = 'Start date must be before end date'
         Swal.fire({
            title: 'Error!',
            text: msg,
            icon: 'error',
            confirmButtonText: 'Ok'
         })
         throw new Error(msg)
      }
      if (dateFns.parse(endDate, "yyyy-MM-dd") > new Date()) {
         const msg = 'End date must be less or equal than today'
         Swal.fire({
            title: 'Error!',
            text: msg,
            icon: 'error',
            confirmButtonText: 'Ok'
         })
         throw new Error(msg)
      }
   }
 }