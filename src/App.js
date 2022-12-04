import { useState, useEffect, useRef } from 'react';
import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { logDOM } from '@testing-library/react';


const exhangeRate =   {
  "id": 1,
  "amount": 1.5457,
  "currency": {
    "id": 10,
    "name": "AUD",
    "descriptionLt": "Australijos doleris",
    "descriptionEn": "Australian dollar",
    "isoNumber": "036",
    "exponentUnits": 2
  },
  "currencyId": 10
}

const CurrencyCell = (props) => {
  function HandleClick(e){
    e.target.parentElement.parentElement.style.border="1px solid black";
    alert('clicked table '+props.currencyId);
  }

  return(
    <>
    <table border="1" className="table table-striped table-bordered" onClick={HandleClick}>
      <thead></thead>
      <tbody>
        <tr><td>{props.currencyName}</td><td>{props.exchangeRate}</td></tr>
        <tr><td colSpan="2" >{props.currencyDescription}</td></tr>
      </tbody>
      <tfoot></tfoot>
    </table>
    </>  
  )
}



function App() {
  const currency = "USD";
  const index = 0;
  const [counter, setCounter] = useState(0);
  const [exchangerates, setExchangerates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState([]);
  const [historyCurrency, setHistoryCurrency] = useState("");
  const [movies, setMovies] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [exchangeRateCurrency, setExchangeRateCurrency] = useState("");
  const inputRef = useRef(null);
  const selectInputRef = useRef(null);
  const tableRef = useRef([]);
  

  const searchCurrency = async (id) => {
    const response = await fetch('http://localhost:3001/api/v2/currency');
    const data = await response.json();
    console.log("data object "+data[1].id);
    setMovies(data);
  }

  const loadCurrentExchangeRates = async () => {
    const response = await fetch('http://localhost:3001/api/v2/exchange_rate_current');
    const data = await response.json();
    console.log(data);
    setExchangerates(data);
  }

  const loadExchangeRatesHistory = async () => {
    const response = await fetch('http://localhost:3001/api/v2/exchange_rate_history/173');
    const data1 = await response.json();
    console.log(data1);
    setHistoryCurrency(data1[0].currency.name); 
    setHistory(data1);
  }

  const loadExchangeRatesHistoryById = async (id) => {
    const response = await fetch('http://localhost:3001/api/v2/exchange_rate_history'+"/"+id);
    const data2 = await response.json();
    console.log(data2);
    setHistoryCurrency(data2[0].currency.name); 
    setHistory(data2);
  }


  console.log("history length"+ history.length)
  history.map((item) => { item.currencyDate = item.currencyDate.toString().substring(0,10); })
  const chartHistoryData = history.map((item) => { 
            return { currencyDate: item.currencyDate, ExchangeRate: item.amount }
  }) 
  console.log("chartHistoryData length"+ chartHistoryData.length)

  useEffect(() => {
    loadCurrentExchangeRates();
    loadExchangeRatesHistory();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("refresh page");
      window.location.reload(false);
    }, 36000000);
  });

  function handleCounterClick(e){
    let exrate = null;
    exchangerates.map((item) => {
       if(item.id == selectInputRef.current.value) {exrate = item} ;
    });
    let totalSumm = inputRef.current.value * exrate.amount;
    totalSumm = (totalSumm).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    setCounter(totalSumm);
    setExchangeRate(exrate.amount);
    setExchangeRateCurrency(exrate.currency.name);
  }

  function handleCounterEnterClick(e){
    if(e.key === 'Enter'){
      handleCounterClick(e);
    }
  }

  return (
    <div className="flex-container">
    <header><h1 ><i class="bi bi-bank2"></i> Valiutų kursų portalas</h1>
    </header>
    <main>
      <article>
            
          <div >Buhalterinių valiutų kursų puslapis. Rodomi valiutų kursai iš Lietuvos Banko</div>
          <div>
          <div>
            { 
              exchangerates.map((exchangerate, index1) => (
                <div>
                  <table border="1" className="table table-striped table-bordered" onClick={(e) => 
                                { 
                                  tableRef.current.map((innerElRef, index) => (innerElRef.style.border = '1px solid #E8E8E8'));
                                  tableRef.current[index1].style.border = '1px solid black';
                                  loadExchangeRatesHistoryById(exchangerate.currency.id);
                                  window.location.replace("/#char_anchor");
                              }} ref={el => tableRef.current[index1] = el}>
                   <thead></thead>
                   <tbody>
                   <tr><td>{exchangerate.currency.name}</td><td>{exchangerate.amount}</td></tr>
                    <tr><td colSpan="2" >{exchangerate.currency.descriptionLt}</td></tr>
                    </tbody>
                    <tfoot></tfoot>
                   </table>
                </div>                
              ))
            }

          </div>
          <div id="char_anchor">
            <a  >{historyCurrency} valiutos kursų istorija <i class="bi bi-clock-history"></i></a>
            <LineChart width={500} height={300} data={chartHistoryData} margin={{top: 5,right: 30,left: 20,bottom: 5,}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="currencyDate" />
              <YAxis />
              <Tooltip  />
              <Legend />
              <Line type="monotone" dataKey="ExchangeRate" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>

            
          </div>
          </div>
      </article>
      <aside>
        
        <div className="m-4">
            <h2>Valiutos skaičiuoklė</h2>
            <hr/>
            <h3>{counter} {exchangeRateCurrency}</h3> <p>kursas {exchangeRate}</p>  
           <label>Suma</label>
           <input type="text" name="amount" pattern="[0-9]" placeholder='0' onKeyPress={(event) => 
                               {if (!/^\d{1,}(\.\d{0,4})?$/.test(event.key)) {event.preventDefault();}}} ref={inputRef} onKeyDown={handleCounterEnterClick}/>

            <br/>
           <label>Valiuta</label>
           <select ref={selectInputRef}>
            { 
              exchangerates.map((exchangerate, index1) => (
                <option key={exchangerate.id} value={exchangerate.id} >{exchangerate.currency.name} ({exchangerate.currency.descriptionLt})</option>               
              ))
            }
           </select>
           <br/>
           <br/>
           <button className="btn btn-primary" onClick={handleCounterClick}><i class="bi bi-cash-stack"></i> Skaičiuoti</button>
           <hr/>
        </div>
        
        
        <div>
        </div>
      </aside>
    </main>
    <footer><i class="bi bi-code-square"></i> Made by Gintarė Ragaišienė</footer>
  </div>	    
  );
}

export default App;
