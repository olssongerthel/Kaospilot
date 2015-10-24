### Functions
<dl>
<dt><a href="#log">log(data)</a></dt>
<dd><p>Generates a log entry.</p>
</dd>
<dt><a href="#handlebars">handlebars(options, callback)</a></dt>
<dd><p>Generates HTML by supplying the data along with a HBS template to use.</p>
</dd>
<dt><a href="#composer">composer(options)</a></dt>
<dd><p>Sends an e-mail via SMTP.</p>
</dd>
<dt><a href="#kalabalik">kalabalik(options, callback)</a></dt>
<dd><p>Requests data from an instance of Kalabalik</p>
</dd>
</dl>
### Typedefs
<dl>
<dt><a href="#templateCallback">templateCallback</a> : <code>function</code></dt>
<dd><p>Callback for Handlebars.</p>
</dd>
<dt><a href="#requestCallback">requestCallback</a> : <code>function</code></dt>
<dd><p>Callback for Kalabalik.</p>
</dd>
</dl>
<a name="log"></a>
### log(data)
Generates a log entry.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | A Winston log object. |
| data.meta | <code>Object</code> |  |
| data.meta.plugin | <code>String</code> | The human readable name of your plugin, i.e the same as exports.label from your plugin. |

<a name="handlebars"></a>
### handlebars(options, callback)
Generates HTML by supplying the data along with a HBS template to use.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.plugin | <code>String</code> | The machine readable name of the plugin. |
| options.template | <code>String</code> | The name of the template file. The file must be located in a 'templates' folder in the plugin folder and use a '.hbs' file extension. |
| options.data | <code>Object</code> | A javascript object containing the data. |
| callback | <code>[templateCallback](#templateCallback)</code> | A callback to run. |

<a name="composer"></a>
### composer(options)
Sends an e-mail via SMTP.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| [options.transporterOpt] | <code>String</code> | A valid Nodemailer transporter options object. See Nodemailer module docs for more info. |
| options.mailoptions | <code>String</code> | A valid Nodemailer mailoptions object. See Nodemailer module docs for more info. |

<a name="kalabalik"></a>
### kalabalik(options, callback)
Requests data from an instance of Kalabalik

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.requestUrl | <code>String</code> | The request URL incl. "/" |
| options.method | <code>String</code> | The HTTP method to use (GET, PUT) etc. |
| [options.body] | <code>String</code> | The body of the request (for PUT etc.) |
| callback | <code>[requestCallback](#requestCallback)</code> | A callback to run. |

<a name="templateCallback"></a>
### templateCallback : <code>function</code>
Callback for Handlebars.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| compiled | <code>String</code> | The compiled HTML. |

<a name="requestCallback"></a>
### requestCallback : <code>function</code>
Callback for Kalabalik.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>obj</code> | An explanation of the error that occured. |
| body | <code>obj</code> | The body of the request response in JSON format. |

