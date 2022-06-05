import { getSummary } from './service.js'
import { sort } from './util.js'

const confirmedE = document.getElementById('confirmed')
const deathE = document.getElementById('death')
const recoveredE = document.getElementById('recovered')
const updateDateE = document.getElementById('date')
const totalsGraphE = document.getElementById('totals-graph')
const top10GraphE = document.getElementById('top-10-gaph')
let totalsGraph;
let top10Graph;

async function init() {
   const data = await getSummary();
   renderData(data)
}
init()

function renderData(data) {
   const totalConfirmed = (+data.Global.TotalConfirmed).toLocaleString("pt-BR")
   const newConfirmed = (+data.Global.NewConfirmed).toLocaleString("pt-BR")
   const totalDeath = (+data.Global.TotalDeaths).toLocaleString("pt-BR")
   const newDeath = (+data.Global.NewDeaths).toLocaleString("pt-BR")
   const totalRecovered = (+data.Global.TotalRecovered).toLocaleString("pt-BR")
   const newRecovered = (+data.Global.NewRecovered).toLocaleString("pt-BR")
   const updateDate = new Date(Date.parse(data.Global.Date)).toLocaleDateString('pt-BR', {timeZone: 'America/Recife'})

   confirmedE.textContent = totalConfirmed
   deathE.textContent = totalDeath
   recoveredE.textContent = totalRecovered
   updateDateE.textContent += updateDate

   renderDistributionNewCasesGraph(
      ["Confirmed", "Recovered", "Death"], 
      [newConfirmed, newRecovered, newDeath]
   )

   renderTop10TotalDeathsByCountryGraph(data.Countries)
}

function renderDistributionNewCasesGraph(labels, data) {
   if (totalsGraph) {
      totalsGraph.destroy()
   }
   totalsGraph = new Chart(totalsGraphE, {
      type: 'pie',
      data: {
         labels: labels,
         datasets: [
            {
               data: data,
               backgroundColor: ["#e8a220", "#3e95cd", "#e82020"]
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

function renderTop10TotalDeathsByCountryGraph(countries) {
   const top10Countries = sort(countries, "TotalDeaths", "desc").slice(0, 10)
   const labels = top10Countries.map( e => e.Country)
   const values = top10Countries.map( e => e.TotalDeaths)

   if (top10Graph){
      top10Graph.destroy()
   }
   top10Graph = new Chart(top10GraphE, {
      type: 'bar',
      data: {
         labels: labels,
         datasets: [
            {
               label: '',
               data: values,
               backgroundColor: ["#94188a"]
            }
         ]
      },
      options: {
         responsive: true,
         plugins: {
            legend: {
               display: false
            },
            title: {
               display: true,
               fullSize: true,
               font: {
                  size: 26
               },
               text: 'Total Deaths by Country - Top 10'
            }
         }
      }
   })
}