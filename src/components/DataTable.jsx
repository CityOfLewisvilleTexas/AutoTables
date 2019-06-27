import Inferno from 'inferno';
import Component from 'inferno-component';
import moment from 'moment';
import CsvDownloadButton from './CsvDownloadButton.jsx';

class DataTable extends Component {
	constructor (){
		super();
		this.state = {
			filters : {},
			sort : {
				key : null,
				asc : null
			}
		}
	}

	applyFilter(keyToFilter, value){
		let filters = this.state.filters;
		// a blank filter will exclude null values, so if the user gets rid of a filter, it removes it altogether
		if (value !== '')filters[keyToFilter] = value;
		else delete filters[keyToFilter];
		this.setState({filters});
	}
	
	blurOnFilterField(e){
		const keyToFilter = e.target.form[0].value;
		const value = e.target.form[1].value;
		this.applyFilter(keyToFilter, value);
	}

	keyPressOnFilterField(e){
		// user pressed enter
		if (e.keyCode === 13){
			const keyToFilter = e.target.form[0].value;
			const value = e.target.form[1].value;
			this.applyFilter(keyToFilter, value);
		}
	}

	formatCellData(value){
		if (typeof value !== 'string'){
			if (typeof value === 'object' && value !== null){
				return <button className="btn btn-info">See Data</button>
			}else{
				return value;
			}
		}else{
			if (value.substring(0,4) === '/9j/'){
				return <a target="_blank" href={'data:image/jpg;base64,' + value}><img src={'data:image/jpg;base64,' + value} className="img-responsive"></img></a>
			}else if (value.substring(0,4) === 'http'){
				const imageFileExtensions = ['.jpg', '.png', '.tiff', '.gif', '.webp', '.bpg'];
				if (imageFileExtensions.indexOf(value.substring(value.length - 4).toLowerCase()) > -1){
					return <a target="_blank" href={value}><img src={value} className="img-responsive"></img></a>
				}
				else{
					return <a target="_blank" href={value}>{value}</a>
				}
			}else{
				return value
			}
		}
	}

	formatHeaderButton(header, title){
		if (this.state.sort.key !== header){
			 return <th><button className="btn" onClick={() => {this.sortData(header)}}>{header.replace(/_/g, ' ')}</button></th>
		}else{
			if (this.state.sort.asc){
				 return <th><button className="btn btn-info" onClick={() => {this.sortData(header)}}>{header.replace(/_/g, ' ')} <span class="glyphicon glyphicon-triangle-top"></span></button></th>
			}else{
				 return <th><button className="btn btn-info" onClick={() => {this.sortData(header)}}>{header.replace(/_/g, ' ')} <span class="glyphicon glyphicon-triangle-bottom"></span></button></th>
			}
		}
	}
	
	sortData(key){
		let data = this.props.data;
		let keyType = null;
		for (var i = 0; i <= data.length; i++){
			if (data[i][key] !== null){
				keyType = typeof data[i][key]
				break
			}
		}
		if ((this.state.sort.key === key && !this.state.sort.asc) || this.state.sort.key !== key){
			data = data.sort((a,b) => {
					// sort ascending
					if (keyType === 'number'){
						return a[key] - b[key];
					}else if (keyType === 'string'){
						let c = a[key] || '';
						let d = b[key] || '';
						c = c.toUpperCase();
						d = d.toUpperCase();
						if(c.substring(0,1) === '$'){
							const cMoney = parseFloat(c.substring(1).replace(/,/g, ''));
							const dMoney = parseFloat(d.substring(1).replace(/,/g, ''));
							return cMoney - dMoney;
						}else{
							const cDate = new moment(c);
							const dDate = new moment(d);
							if (cDate._isValid || dDate._isValid){
								if (cDate.isBefore(dDate)){
									return -1
								}else if (cDate.isAfter(dDate)){
									return 1
								}else{
									return 0
								}
							}else{
								if (c < d) {
									return -1;
								}else if (c > d) {
									return 1;
								}else{
									return 0;
								}
							}	
						} 
					}
			})
		}else{
			data = data.sort((a,b) => {
					// sort descending 
					if (keyType === 'number'){
						return b[key] - a[key];
					}else if (keyType === 'string'){
						let c = a[key] || '';
						let d = b[key] || '';
						c = c.toUpperCase();
						d = d.toUpperCase();
						if(c.substring(0,1) === '$'){
							const cMoney = parseFloat(c.substring(1).replace(/,/g, ''));
							const dMoney = parseFloat(d.substring(1).replace(/,/g, ''));
							return dMoney - cMoney;
						}else{
							const cDate = new moment(c);
							const dDate = new moment(d);
							if (cDate._isValid || dDate._isValid){
								if (dDate.isBefore(cDate)){
									return -1
								}else if (dDate.isAfter(cDate)){
									return 1
								}else{
									return 0
								}
							}else{
								if (c > d) {
									return -1;
								}else if (c < d) {
									return 1;
								}else{
									return 0;
								}
							}
						}
					}
			})
		}
		if (this.state.sort.key === key){
			// this.state.sort.asc = !this.state.sort.asc;
			this.setState({sort : {key : key, asc : !this.state.sort.asc}})
		}else{
			this.setState({
				sort : {
					key : key,
					asc : true
				}
			})
		}
		// this.setState({data});
		this.props.updateData(this.props.title, data);
	}

	render(){
		let getNonObjectKeys = function(obj){
			var nonObjectKeys = [];
			for (var key in obj){
				if (typeof obj[key] !== 'object' || obj[key] === null){
					nonObjectKeys.push(key);
				}
			}
			return nonObjectKeys;
		}

		let getObjectKeys = function(obj){
			var objectKeys = [];
			for (var key in obj){
				if (typeof obj[key] === 'object' && obj[key] !== null){
					objectKeys.push(key);
				}
			}
			return objectKeys;
		}

		let getTableFromData = function(data, title){
			let filteredData = data;
			for (var key in this.state.filters){
				filteredData = filteredData.filter( (val) => {
					try{
						return val[key].toString().toUpperCase().indexOf(this.state.filters[key].toUpperCase()) > -1;
					}catch(err){
						return false;
					}
				})
			}

			return (
				<div>
					<h2>{parseInt(title) === 'NaN' ? '' : title}</h2>
					<CsvDownloadButton buttonClass="btn-primary" jsonData={data} title={title} buttonText="Download All Data" />
					<div style="width : 10px; display : inline"> </div>
					<CsvDownloadButton buttonClass="btn-danger" jsonData={filteredData} title={title} buttonText="Download Filtered Data" />
					<table className="table table-striped table-bordered table-responsive">
						<thead>
							<tr>
								{Object.keys(data[0]).map( (header) => {
									return this.formatHeaderButton(header, title)
								})}
							</tr>
							<tr>
								{Object.keys(data[0]).map( (header) => {
									return (
										<th>
											<form>
												<input type="text" hidden value={header} />
												<input placeholder={'Filter'} className="form-control" onBlur={this.blurOnFilterField.bind(this)} onKeyPress={this.keyPressOnFilterField.bind(this)} type="text" />
											</form>
										</th>
									)
								})}
							</tr>
							<tr>
								{Object.keys(data[0]).map( (header) => {
									return (
										<td className={header in this.state.filters ? 'info' : ''}>
											<i>{this.state.filters[header]}</i>
										</td>
									)
								})}
							</tr>
						</thead>
						<tbody>
							{filteredData.map( (row) => {
								return (
									<tr> {Object.keys(row).map( (cell) => {
										return <td>{this.formatCellData(row[cell])}</td>
									})} </tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)
		}.bind(this)

		return (
			<div>
				{getTableFromData(this.props.data, this.props.title)}
				
			</div>
		)
	}
}


export default DataTable;