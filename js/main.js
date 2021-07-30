// DECLARE VARIABLE TO CHOOSE ENDPOINT
const url = document.title.includes('Senators')
    ? 'senate'
    : 'house'

// DECLARE VARIABLE TO USE API KEY
let init = {
    headers:{
        'X-API-Key': '7IBdtYXOoDf6A5WjVIpTLkZIdUOvTB4gJ4BqmjJL'
    }
}
// hola
// FETCHING API
fetch(`https://api.propublica.org/congress/v1/113/${url}/members.json`, init)
    .then(res=>res.json())
    .then(json=>{
        let data = [...json.results[0].members]
        myApp(data)
    })
    .catch(err=>console.log(err.message))

    // MAIN APPLICATION
const myApp = ((data)=>{
    // CODE TO EXECUTE ONLY IN HOME PAGE
    if(document.title=='Transparent Government In Fact'){
        // CHANGE INNER TEXT OF BUTTON READ MORE
        document.getElementById('rm-button').addEventListener('click', function (e){
            this.innerText = this.innerText == 'Read More' ? 'View Less' : 'Read More'
        })
    }else{
        // CREATING A COPY OF DATA TO USE IT IN ALL TABLES
        let members = JSON.parse(JSON.stringify(data))
        // 
        if(document.getElementById('houseData')||document.getElementById('senateData')){
    
            let table = document.getElementById('houseData') 
                ? document.getElementById('houseData')
                : document.getElementById('senateData')
            
            var stateFilter = 'all'
            var membersToShow = []
    
            // FUNCTION TO DEFINE FILTERS BEFORE RENDERING THE TABLE
            function readFilters(){
                stateFilter=="all" 
                    ? membersToShow=members
                    : membersToShow=members.filter(member=>member.state==stateFilter)
                membersToShow=membersToShow.filter(member=>partyFilter.includes(member.party))
            }
    
            // DEFINING FUNCTION TO RENDER THE TABLE
            function showData(){
                table.innerHTML=""
                readFilters()
                membersToShow.forEach(member=>{
                    let memberData= [`${member.last_name} ${member.first_name} ${member.middle_name || ""}`, member.party, member.state, member.seniority, `${member.votes_with_party_pct.toFixed(2)} %`]
                    let newRow = document.createElement('tr')
                    memberData.forEach((information)=>{
                        let tableData = document.createElement('td')
                        if(information==memberData[0]){
                            let anchor = document.createElement('a')
                            anchor.href = member.url
                            anchor.target = '_blank'
                            anchor.innerText = information
                            tableData.appendChild(anchor)
                        }else{
                            tableData.innerText=information
                        }
                        newRow.appendChild(tableData)
                    })
                    table.appendChild(newRow)
                })
                document.getElementById('results').innerText=`Showing ${membersToShow.length} of ${members.length} entries`
                // console.log(`Showing ${membersToShow.length} entries of ${members.length}`)
            }
    
            // CREATING  TWO ARRAYS. ONE THAT INCLUDES ALL STATES AND THE SECOND THAT INCLUDES ALL PARTIES (BOTH NON REPEATED)
            var partyFilter = []
            let nonRepeatedStates = []
    
            members.forEach(member=>{
                if(!nonRepeatedStates.includes(member.state)){
                    nonRepeatedStates.push(member.state)
                }
                if(!partyFilter.includes(member.party)){
                    partyFilter.push(member.party)
                }
            })
    
            // ADDING THE PREVIOUS STATES AS "OPTION" OF "SELECT"
            let select = document.getElementById('states')
            nonRepeatedStates.sort().forEach(state=>{
                let option = document.createElement('option')
                option.value=state
                option.innerText=state
                select.appendChild(option)
            })
    
            // RUNNING FUNCTION TO RENDER TABLE WHEN PAGE LOADS THE FIRST TIME
            function preload(){
                let preloader = document.getElementById('preloader')
                showData()
                preloader.classList.add('d-none')
            }
            preload()
    
            // EVENT LISTENER FOR SELECT ELEMENT
            select.addEventListener('change', function(e){
                stateFilter = this.value
                preload()
            })
    
            // EVENT LISTENER FOR INPUTS TYPE CHECKBOX
            Array.from(document.getElementsByName('party')).forEach(input=>{
                input.addEventListener('change', function(e){
                    partyFilter.includes(this.value)
                        ? partyFilter=partyFilter.filter(party=>party!==this.value)
                        : partyFilter.push(this.value)
                    preload()
                })
            })
        }else{
            // ARRAY WITHOUT MEMBERS WITH "TOTAL_VOTES=0"
            let nonZeroMembers = members.filter(member=>member.total_votes>0)
            // ORDERER MEMBERS BY MISSED VOTES
            let orderedMembers = JSON.parse(JSON.stringify(nonZeroMembers)).sort((a,b)=>a.missed_votes_pct-b.missed_votes_pct) //ordenador de menor a mayor
            let breakpoint= orderedMembers[Math.ceil(members.length*0.1)-1].missed_votes_pct
            
            let orderedMembers2 = JSON.parse(JSON.stringify(nonZeroMembers)).sort((a,b)=>b.missed_votes_pct-a.missed_votes_pct) //ordenador de mayor a menor
            let breakpoint2= orderedMembers2[Math.ceil(members.length*0.1)-1].missed_votes_pct

            // ORDERER MEMBERS BY VOTES WITH PARTY
            let orderedMembers3 = JSON.parse(JSON.stringify(nonZeroMembers)).sort((a,b)=>a.votes_with_party_pct-b.votes_with_party_pct) //ordenador de menor a mayor
            let breakpoint3= orderedMembers3[Math.ceil(members.length*0.1)-1].votes_with_party_pct
            
            let orderedMembers4 = JSON.parse(JSON.stringify(nonZeroMembers)).sort((a,b)=>b.votes_with_party_pct-a.votes_with_party_pct) //ordenador de mayor a menor
            let breakpoint4= orderedMembers4[Math.ceil(members.length*0.1)-1].votes_with_party_pct
            
            // DEFINING EMPTY STATISTICS OBJECT
            const statistics = {}
            // FILLING IN "STATISTICS" OBJECT
            // GET NUMBER OF MEMBER PER EACH PARTY
            statistics.numOfDem = getNumberPerParty(members, 'D')
            statistics.numOfRep = getNumberPerParty(members, 'R')
            statistics.numOfInd = getNumberPerParty(members, 'ID')
            statistics.totalReps = members.length


            // GET THE AVERAGE OF "MISSED VOTES PERCENTAGE" FOR EACH PARTY
            statistics.missedVotesDem = reduceValueForParty(nonZeroMembers, 'D', 'missed_votes_pct', 'numOfDem')
            statistics.missedVotesRep = reduceValueForParty(nonZeroMembers, 'R', 'missed_votes_pct', 'numOfRep')
            statistics.missedVotesInd = reduceValueForParty(nonZeroMembers, 'ID', 'missed_votes_pct', 'numOfInd')
            // GET NEWS ARRAY THAT ONLY INCLUDES TOP 10% AND BOTTOM 10% ENGAGED
            statistics.mostEngaged = orderedMembers.filter(member=>member.missed_votes_pct<=breakpoint)
            statistics.leastEngaged = orderedMembers2.filter(member=>member.missed_votes_pct>=breakpoint2)


            // GET THE AVERAGE OF "VOTES WITH PARTY PERCENTAGE" FOR EACH PARTY
            statistics.votesWithPartyDem = reduceValueForParty(nonZeroMembers, 'D', 'votes_with_party_pct', 'numOfDem')
            statistics.votesWithPartyRep = reduceValueForParty(nonZeroMembers, 'R', 'votes_with_party_pct', 'numOfRep')
            statistics.votesWithPartyInd = reduceValueForParty(nonZeroMembers, 'ID', 'votes_with_party_pct', 'numOfInd')
            // GET NEWS ARRAY THAT ONLY INCLUDES TOP 10% AND BOTTOM 10% LOYALTY
            statistics.leastLoyal = orderedMembers3.filter(member=>member.votes_with_party_pct<=breakpoint3)
            statistics.mostLoyal = orderedMembers4.filter(member=>member.votes_with_party_pct>=breakpoint4)

            // DEFINING DATA TO SHOW
            let glanceData, leastData, mostData, property
            let glanceTable, leastTable, mostTable
            if(document.title.includes('Attendance')){
                glanceData = [
                    {
                        name: "Democrats",
                        qty: statistics.numOfDem,
                        percentage: statistics.missedVotesDem
                    },
                    {
                        name: "Republicans",
                        qty: statistics.numOfRep,
                        percentage: statistics.missedVotesRep
                    },
                    {
                        name: "Independants", 
                        qty: statistics.numOfInd, 
                        percentage: `${isNaN(parseInt(statistics.missedVotesInd))?'-':statistics.missedVotesInd}`
                    },
                    {
                        name: "Total",
                        qty: statistics.totalReps,
                        percentage: '-'
                    }
                ]
                leastData = statistics.leastEngaged
                mostData = statistics.mostEngaged
                glanceTable = document.getElementById('glance')
                leastTable = document.getElementById('leastEngaged')
                mostTable = document.getElementById('mostEngaged')
                property = 'missed'
            }else{
                glanceData = [
                    {
                        name: "Democrats",
                        qty: statistics.numOfDem,
                        percentage: statistics.votesWithPartyDem
                    },
                    {
                        name: "Republicans",
                        qty: statistics.numOfRep,
                        percentage: statistics.votesWithPartyRep
                    },
                    {
                        name: "Independants", 
                        qty: statistics.numOfInd, 
                        percentage: '-'
                    },
                    {
                        name: "Total",
                        qty: statistics.totalReps,
                        percentage: '-'
                    }
                ]
                leastData = statistics.leastLoyal
                mostData = statistics.mostLoyal
                glanceTable = document.getElementById('glanceLoyalty')
                leastTable = document.getElementById('leastLoyal')
                mostTable = document.getElementById('mostLoyal')
                property = 'withParty'
            }
            
            // FUNCTION TO COUNTS MEMBERS OF AN ARRAY WHO BELONGS TO EACH PARTY
            function getNumberPerParty(members, party){
                return members.filter(member=>member.party==party).length
            }
            // GET THE AVERAGE OF A PROPERTY OF ALL MEMBERS OF A PARTY
            function reduceValueForParty(members, party, property, membersQty){
                let propertySumation = members.reduce((total, member)=>{
                    let iterator = member.party == party ? member[property] : 0
                    return total + iterator
                }, 0)
                return `${(propertySumation/statistics[membersQty]).toFixed(2)} %`
            }
            
            function renderTable(information, father){
                information.forEach(data=>{
                    var newRow = document.createElement('tr')
                    for(const property in data){
                        let newCell = document.createElement('td')
                        newCell.innerText = data[property]
                        newRow.appendChild(newCell)
                    }
                    father.appendChild(newRow)
                })
            }
            
            function renderBigTables(information, father, property){
                information.forEach(data=>{
                    var newRow = document.createElement('tr')
                    let newCell = document.createElement('td')
                    newCell.innerHTML=`<a href="${data.url}" target="_blank">${data.last_name} ${data.first_name} ${data.middle_name || ""}</a>`
                    newRow.appendChild(newCell)
                    let newCell2 = document.createElement('td')
                    let newCell3 = document.createElement('td')
                    if(property=="missed"){
                        newCell2.innerText = data.missed_votes
                        newCell3.innerText = `${(data.missed_votes_pct).toFixed(2)} %`
                    }else{
                        newCell2.innerText = `${Math.ceil(data.total_votes*data.votes_with_party_pct/100)}`
                        newCell3.innerText = `${data.votes_with_party_pct.toFixed(2)} %`
                    }
                    newRow.appendChild(newCell2)
                    newRow.appendChild(newCell3)
                    father.appendChild(newRow)
                })
            }

            function preload(){
                let preloader = document.getElementById('preloader')
                renderTable(glanceData, glanceTable)
                renderBigTables(leastData, leastTable, property)
                renderBigTables(mostData, mostTable, property)
                preloader.classList.add('d-none')
            }
            preload()
        }
    }
}) 

    // EVENT LISTENER TO INCREASE FONT SIZE
    // let tags = ['p', 'a']
    // let selectedElements = []
    // tags.forEach(tag=>{
    //     selectedElements= selectedElements.concat(Array.from(document.querySelectorAll(tag)))
    // })
    // let paragraphs = Array.from(document.getElementsByTagName('p'))
    // document.getElementById('more').addEventListener('click', (e)=>{
    //     selectedElements.forEach(paragraph=>{
    //         if(!paragraph.className || paragraph.className=="" ||paragraph.classList=="fs-6"){
    //             paragraph.classList.remove('fs-6')
    //             paragraph.classList="fs-5"
    //         }else if(paragraph.classList=="fs-5"){
    //             paragraph.classList.remove('fs-5')
    //             paragraph.classList="fs-4"
    //             }else{  //if(paragraph.classList=="fs-4")
    //             paragraph.classList.remove('fs-4')
    //             paragraph.classList="fs-3"
    //         }
    //     })
    // })
    
    // EVENT LISTENER TO DECREASE FONT SIZE
    // document.getElementById('less').addEventListener('click', (e)=>{
    //     selectedElements.forEach(paragraph=>{
    //         if(paragraph.classList=="fs-3"){
    //             paragraph.classList.remove('fs-3')
    //             paragraph.classList="fs-4"
    //         }else if(paragraph.classList=="fs-4"){
    //             paragraph.classList.remove('fs-4')
    //             paragraph.classList="fs-5"
    //         }else{
    //             paragraph.classList.remove('fs-5')
    //             paragraph.classList="fs-6"
    //             // paragraph.classList.remove()
    //         }
    
    //         // if(!paragraph.className){
    //         //     paragraph.className=""
    //         // }else if(paragraph.classList=="fs-4"){
    //         //     paragraph.classList="fs-5"
    //         // }else if(paragraph.classList=="fs-5"){
    //         //     paragraph.classList="fs-6"
    //         //     // paragraph.classList.remove()
    //         // }else{
    //         //     paragraph.className=""
    //         // }
    //     })
    // })
    
    // EVENT LISTENER TO CHANGE BETWEEN DARK MODE AND NORMAL MODE
    // document.getElementById('mode').addEventListener('click', function(e){
    //     let body = document.getElementById('body')
    //     if(this.getAttribute('src') == './assets/moon.png'){
    //         this.setAttribute('src', './assets/sun.png')
    //         body.className+=" bg-dark text-white"
    //     }else{
    //         this.setAttribute('src', './assets/moon.png')
    //         body.classList.remove(" bg-dark text-white")
    //     }
    // })
