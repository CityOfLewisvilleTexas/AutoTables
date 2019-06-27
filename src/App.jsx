import axios from 'axios'
import Inferno from 'inferno'
import Component from 'inferno-component'
import logo from './logo.svg'
import './App.css'
import qs from 'qs'
import DataTable from './components/DataTable.jsx'
import ParameterInput from './components/ParameterInput.jsx'
import CsvDownloadButton from './components/CsvDownloadButton.jsx'
import moment from 'moment'

class App extends Component {
	constructor() {
		super()
		this.state = {
			data: [],
			dataIsLoading: false,
			webserviceName: '',
			parameters: [],
			parametersLoaded: false,
			sort: {
				key: null,
				asc: null
			}
		}
		try {
			if (window.location.href.split('://')[1].split('.')[0].toLowerCase() === 'eservices') {
				this.apiUrl = 'http://query.cityoflewisville.com/v2/'
			} else {
				this.apiUrl = 'http://ax1vnode1.cityoflewisville.com/v2/'
			}
		} catch (err) {
			this.apiUrl = 'http://query.cityoflewsville.com/v2/'
		}
	}

	componentDidMount() {
		this.initializeWebserviceInfo()
		window.addEventListener('hashchange', this.initializeWebserviceInfo.bind(this), false)
	}

	initializeWebserviceInfo() {
		// this.setState({data : []})
		var urlQuery = {}
		if (window.location.search !== '') {
			window.location.search.replace(/\?/, '').split('&').map(function(val) {
				urlQuery[decodeURIComponent(val.split('=')[0])] = decodeURIComponent(val.split('=')[1])
			})
		}
		urlQuery['auth_token'] = localStorage.colAuthToken
		var upperUrlQuery = {}
		for (var key in urlQuery) {
			upperUrlQuery[key.toUpperCase()] = urlQuery[key]
		}
		if (!upperUrlQuery['WEBSERVICE']) {
			urlQuery['webservice'] = window.location.hash.replace(/#/, '')
			upperUrlQuery['WEBSERVICE'] = window.location.hash.replace(/#/, '')
		}
		this.setState({ webserviceName: upperUrlQuery['WEBSERVICE'] })
		//bye
		axios
			.post(
				this.apiUrl,
				qs.stringify({
					webservice: 'ITS/Auto Tables/Is Oauth Required',
					webservice_name: upperUrlQuery['WEBSERVICE']
				})
			)
			.then(e => {
				var data = e.data
				if (data[0][0]['OAUTH_REQUIRED']) {
					;(function() {
						//redirects user if they navigate to apps/ instead of apps.cityoflewisville.com/; OAUTH will not redirect to apps/
						if (window.location.host === 'apps') {
							window.location =
								'http://apps.cityoflewisville.com' +
								window.location.pathname +
								window.location.search +
								window.location.hash
						} else {
							var apiUrl, oauthRedirectUrl
							if (window.location.href.split('://')[1].split('.')[0].toLowerCase() === 'eservices') {
								apiUrl = 'https://query.cityoflewisville.com/'
								oauthRedirectUrl = 'http://eservices.cityoflewisville.com/oauthredirect/index.html'
							} else {
								apiUrl = 'https://ax1vnode1.cityoflewisville.com/'
								oauthRedirectUrl = 'http://apps.cityoflewisville.com/oauthredirect/index.html'
							}
							function getParameterByName(name, url) {
								if (!url) url = window.location.href
								name = name.replace(/[\[\]]/g, '\\$&')
								var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url)
								if (!results) return null
								if (!results[2]) return ''
								return decodeURIComponent(results[2].replace(/\+/g, ' '))
							}
							var code = getParameterByName('code')
							function getNewColAuthToken(code) {
								var redirectUrl = window.location.href.substr(0, window.location.href.indexOf('?'))
								axios
									.post(
										apiUrl + 'authenticate/',
										qs.stringify({
											code: code,
											redirectUrl: redirectUrl
										})
									)
									.then(e => {
										var data = e.data
										localStorage.colAuthToken = data[0][0]['AUTH_TOKEN']
										window.location = localStorage.redirectUrl
									})
							}
							function getNewCode() {
								localStorage.redirectUrl = window.location.href
								// window.location = 'https://accounts.google.com/ServiceLogin?passive=1209600&continue=https://accounts.google.com/o/oauth2/auth?access_type%3Doffline%26scope%3Dhttps://www.googleapis.com/auth/userinfo.email%2Bhttps://www.googleapis.com/auth/userinfo.profile%26response_type%3Dcode%26redirect_uri%3D' + window.location.protocol.toLowerCase() + '//' + window.location.hostname.toLowerCase() + window.location.pathname.toLowerCase() +'%26client_id%3D819027772449-2us5mt2tu1ec84nve9353qka8i6mfj68.apps.googleusercontent.com%26from_login%3D1%26as%3D-64f2a1f67be9764b&oauth=1&sarp=1&scc=1#identifier';
								window.location =
									'https://accounts.google.com/ServiceLogin?passive=1209600&continue=https://accounts.google.com/o/oauth2/auth?access_type%3Doffline%26scope%3Dhttps://www.googleapis.com/auth/userinfo.email%2Bhttps://www.googleapis.com/auth/userinfo.profile%26response_type%3Dcode%26redirect_uri%3D' +
									oauthRedirectUrl +
									'%26client_id%3D819027772449-2us5mt2tu1ec84nve9353qka8i6mfj68.apps.googleusercontent.com%26from_login%3D1%26as%3D-64f2a1f67be9764b&oauth=1&sarp=1&scc=1#identifier'
							}
							function verifyColAuthToken(authToken) {
								axios
									.post(
										apiUrl + 'v2',
										qs.stringify({
											webservice: 'ITS/Verify Auth Token',
											auth_token: authToken
										})
									)
									.then(e => {
										var data = e.data
										if (data['Verification'][0]['VERIFIED'] == 0) {
											getNewCode()
										} else {
											localStorage.removeItem('redirectUrl')
											localStorage.colEmail = data['Verification'][0]['EMAIL']
										}
									})
							}
							if (!localStorage.colAuthToken) {
								if (!code) {
									getNewCode()
								} else {
									getNewColAuthToken(code)
								}
							} else {
								if (!code) {
									verifyColAuthToken(localStorage.colAuthToken)
								} else {
									getNewColAuthToken(code)
								}
							}
						}
					})()
				}
			})
		axios
			.post(
				this.apiUrl,
				qs.stringify({
					webservice: 'ITS/Get Parameters For Webservice',
					webservice_name: decodeURI(this.state.webserviceName),
					auth_token: localStorage.colAuthToken
				})
			)
			.then(e => {
				var data = e.data
				var countOfParametersPreFilled = 0
				if (data.length === 0) {
					data[0] = []
				}
				data[0].map((val, i) => {
					if (upperUrlQuery[val['name'].replace(/@/, '').toUpperCase()]) {
						data[0][i]['value'] = upperUrlQuery[val['name'].replace(/@/, '').toUpperCase()]
						countOfParametersPreFilled += 1
					} else {
						const textTypes = ['char', 'nvarchar', 'varchar', 'varbinary']
						if (textTypes.indexOf(val['PARAMETER_TYPE']) > -1) {
							data[0][i]['value'] = ''
						} else {
							data[0][i]['value'] = null
						}
					}
				})
				this.setState({ parameters: data[0] })
				this.setState({ parametersLoaded: true })
				if (countOfParametersPreFilled === data[0].length) {
					this.getData()
				}
			})
	}

	getData(ev) {
		if (ev) {
			ev.preventDefault()
		}
		var formData = { webservice: decodeURI(this.state.webserviceName), auth_token: localStorage.colAuthToken }
		this.state.parameters.map(val => {
			if (val['PARAMETER_TYPE'] === 'datetime' && val['value']) {
				val['value'] = val['value'].replace(/T/, '')
			}
			formData[val['name'].replace(/@/, '')] = val['value']
		})
		this.setState({ dataIsLoading: true })
		axios
			.post(this.apiUrl, qs.stringify(formData))
			.then(e => {
				let data = e.data
				this.setState({ data })
				this.setState({
					sort: {
						key: null,
						asc: null
					}
				})
				this.setState({ dataIsLoading: false })
			})
			.catch(e => {
				console.log(e)
				let data = [[{ Error: 'An error has occured. Please contact the IT Department' }]]
				this.setState({ data })
				this.setState({
					sort: {
						key: null,
						asc: null
					}
				})
				this.setState({ dataIsLoading: false })
			})
	}

	updateData(resultSet, data) {
		let newData = this.state.data
		newData[resultSet] = data
		this.setState({ data: newData })
	}

	updateParameterValue(parameter, newValue) {
		var parameters = this.state.parameters
		parameters.map((val, index) => {
			if (val['name'] === parameter['name']) {
				parameters[index]['value'] = newValue
			}
		})
		this.setState({ parameters })
	}

	render() {
		// handle zero results
		Object.keys(this.state.data).map(val => {
			if (this.state.data[val].length === 0) {
				this.state.data[val][0] = {}
				this.state.data[val][0]['Error'] = 'No results found'
			}
		})
		if (this.state.dataIsLoading) {
			return (
				<div className="col-sm-offset-1 col-sm-10">
					<title>{decodeURI(this.state.webserviceName).replace(/_/g, ' ')}</title>
					<h1>{decodeURI(this.state.webserviceName).replace(/_/g, ' ')}</h1>
					<form className="form-inline">
						{this.state.parameters.map((val, i) => {
							return (
								<ParameterInput
									index={i}
									parameter={val}
									updateFunction={this.updateParameterValue.bind(this)}
								/>
							)
						})}
						<div className="row" style="margin-top : 10px;">
							<button
								className="btn btn-success"
								style="margin-left : 15px"
								type="submit"
								onClick={this.getData.bind(this)}
							>
								Submit
							</button>
						</div>
					</form>
					<div className="loading-container">
						<div className="dizzy-gillespie" />
					</div>
				</div>
			)
		} else {
			return (
				<div className="col-sm-offset-1 col-sm-10">
					<title>{decodeURI(this.state.webserviceName).replace(/_/g, ' ')}</title>
					<h1>{decodeURI(this.state.webserviceName).replace(/_/g, ' ')}</h1>
					<form className="form-inline">
						{this.state.parameters.map((val, i) => {
							return (
								<ParameterInput
									index={i}
									parameter={val}
									updateFunction={this.updateParameterValue.bind(this)}
								/>
							)
						})}
						<div className="row" style="margin-top : 10px;">
							<button
								className="btn btn-success"
								style="margin-left : 15px"
								type="submit"
								onClick={this.getData.bind(this)}
							>
								Submit
							</button>
						</div>
					</form>
					{Object.keys(this.state.data).map(val => {
						return (
							<DataTable
								updateData={this.updateData.bind(this)}
								data={this.state.data[val]}
								title={val}
							/>
						)
					})}
				</div>
			)
		}
	}
}

export default App
