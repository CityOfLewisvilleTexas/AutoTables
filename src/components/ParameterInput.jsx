import Inferno from 'inferno';
import Component from 'inferno-component';

class ParameterInput extends Component {
	
	constructor(props) {
		super(props);
	}

	componentDidMount(){
		console.log(this.props.index);
		if (this.props.index === 0){
			this.input.focus();
		}
	}

	updateValue(e){
		this.props.updateFunction(this.props.parameter, e.target.value);
	}

	updateCheckboxValueToTrue(e){
		this.props.updateFunction(this.props.parameter, true);
	}

	updateCheckboxValueToFalse(e){
		this.props.updateFunction(this.props.parameter, false);
	}

	getInput(){
		const textTypes = ['char', 'nvarchar', 'varchar', 'varbinary'];
		const numTypes = ['int', 'bigint', 'numeric', 'float', 'decimal'];
		const paramType = this.props.parameter['PARAMETER_TYPE'];
		if (textTypes.indexOf(paramType) > -1){
			return (
				<div className="form-group">
					<label>{this.props.parameter.name.replace(/@/, '').replace(/_/g, ' ')}&nbsp;:&nbsp;</label>
					<input ref={(input) => { this.input = input; }} className="form-control" defaultValue={this.props.parameter.value} onChange={this.updateValue.bind(this)} type="text"> </input>
				</div>
			)
		}else if (paramType === 'datetime'){
			return (
				<div className="form-group">
					<label>{this.props.parameter.name.replace(/@/, '').replace(/_/g, ' ')}&nbsp;:&nbsp;</label>
					<input ref={(input) => { this.input = input; }} className="form-control" defaultValue={this.props.parameter.value} onChange={this.updateValue.bind(this)} type="datetime-local"> </input>
				</div>
			)
		}else if (paramType === 'date'){
			return (
				<div className="form-group">
					<label>{this.props.parameter.name.replace(/@/, '').replace(/_/g, ' ')}&nbsp;:&nbsp;</label>
					<input ref={(input) => { this.input = input; }} className="form-control" defaultValue={this.props.parameter.value} onChange={this.updateValue.bind(this)} type="date"> </input>
				</div>
			)
		}else if (numTypes.indexOf(paramType) > -1){
			return (
				<div className="form-group">
					<label>{this.props.parameter.name.replace(/@/, '').replace(/_/g, ' ')}&nbsp;:&nbsp;</label>
					<input ref={(input) => { this.input = input; }} className="form-control" defaultValue={this.props.parameter.value} onChange={this.updateValue.bind(this)} type="number"> </input>
				</div>
			)
		}else if (paramType === 'bit'){
			if (this.props.parameter.value){
				return (
					<div className="checkbox">
						<label><input ref={(input) => { this.input = input; }} checked="true" onChange={this.updateCheckboxValueToFalse.bind(this)} type="checkbox"></input>&nbsp; {this.props.parameter.name.replace(/@/, '').replace(/_/g, ' ')}</label>
					</div>
				)
			}else{
				return (
					<div className="checkbox">
						<label><input ref={(input) => { this.input = input; }} onChange={this.updateCheckboxValueToTrue.bind(this)} type="checkbox"></input>&nbsp; {this.props.parameter.name.replace(/@/, '').replace(/_/g, ' ')}</label>
					</div>
				)
			}
		}
	}

	render(){
		return (
			this.getInput()
		)
	}
}


export default ParameterInput;