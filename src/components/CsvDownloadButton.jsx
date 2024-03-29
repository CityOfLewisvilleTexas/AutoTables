import Inferno from 'inferno';
import Component from 'inferno-component';


class CsvDownloadButton extends Component{

	JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {

		let getNonObjectKeys = function(obj){
			var nonObjectKeys = [];
			for (var key in obj){
				if (typeof obj[key] !== 'object' || obj[key] === null){
					nonObjectKeys.push(key);
				}
			}
			return nonObjectKeys;
		}

		JSONData = this.props.jsonData;
		JSONData.map( (val) => {
			Object.keys(val).map( (key) =>{
				if (getNonObjectKeys(val).indexOf(key) === -1){
					delete val[key];
				}
			})
		})
		ReportTitle = this.props.title;
		ShowLabel = true;
		//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
		var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

		var CSV = '';    
		//Set Report title in first row or line

		CSV += ReportTitle + '\r\n\n';

		//This condition will generate the Label/Header
		if (ShowLabel) {
			var row = "";

			//This loop will extract the label from 1st index of on array
			for (var index in arrData[0]) {

				//Now convert each value to string and comma-seprated
				row += index + ',';
			}

			row = row.slice(0, -1);

			//append Label row with line break
			CSV += row + '\r\n';
		}

		//1st loop is to extract each row
		for (var i = 0; i < arrData.length; i++) {
			var row = "";

			//2nd loop will extract each column and convert it in string comma-seprated
			for (var index in arrData[i]) {
				if (arrData[i][index] === null) arrData[i][index] = ''
				row += '"' + arrData[i][index] + '",';
			}

			row.slice(0, row.length - 1);

			//add a line break after each row
			CSV += row + '\r\n';
		}

		if (CSV == '') {        
			alert("Invalid data");
			return;
		}   


		//Generate a file name
		var fileName = "MyReport_";
		//this will remove the blank-spaces from the title and replace it with an underscore
		fileName += ReportTitle.replace(/ /g,"_");   

		if (navigator.msSaveBlob){ //Internet Explorer 10+
			var blob = new Blob([CSV], {type : 'text/csv;charset=utf-8;'});
			navigator.msSaveBlob(blob, fileName + '.csv')
		}else{
			//Initialize file format you want csv or xls
			var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV);

			// Now the little tricky part.
			// you can use either>> window.open(uri);
			// but this will not work in some browsers
			// or you will not get the correct file extension  

			//this trick will generate a temp <a /> tag
			var link = document.createElement("a");    
			link.href = uri;

			//set the visibility hidden so it will not effect on your web-layout
			try{
				link.style = "visibility:hidden";
			}catch(err){
				console.log(err)
			}
			link.download = fileName + ".csv";

			//this part will append the anchor tag and remove it after automatic click
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}

	}

	render(){
		return(
			<button className={this.props.buttonClass + ' btn'} onClick={this.JSONToCSVConvertor.bind(this)} >{this.props.buttonText + ' (' + this.props.jsonData.length + ' results)'}</button>
		)
	}
}


export default CsvDownloadButton;