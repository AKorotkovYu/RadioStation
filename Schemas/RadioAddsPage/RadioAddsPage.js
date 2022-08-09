define("RadioAddsPage", ["DomRadioAdvertisingConstantsJs", "ProcessModuleUtilities"], 
       function (DomConstantsJs, ProcessModuleUtilities) {
	return {
		entitySchemaName: "RadioAdds",
		attributes: {},
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{
			"SchemaPublicationsDetail": {
				"schemaName": "SchemaPublicationsDetail",
				"entitySchemaName": "Publications",
				"filter": {
					"detailColumn": "RadioAdds",
					"masterColumn": "Id"
				}
			}
		}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{}/**SCHEMA_BUSINESS_RULES*/,
		methods: {
          
			save: function () {
              this.callParent(arguments);
              this.subscriptionFunction();
			},
          
          	/*
				Функция, выполняющая подписку на канал сообщений
			*/			
			subscriptionFunction: function () {
				Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE, this.onProcessMessage, this);
			},
          
          	/*
				Функция, выполняющая отписку на канала сообщений
			*/		
			onDestroy: function () {
				Terrasoft.ServerChannel.un(Terrasoft.EventName.ON_MESSAGE, this.onProcessMessage, this);
		 		this.callParent(arguments);
			},
          
          	/*
				Функция, выполняющая обработку входящих сообщений
			*/
			onProcessMessage: function (scope, message) {
				//if (!message)
                  if( message.Header.Sender !== "ReloadSchemaPublicationsDetail") {
					return;
				}
				this.updateDetail({ detail: "SchemaPublicationsDetail" });
			}, 
          
          	/*
				Функция, выполняющая валидацию при сохранении
			*/
			asyncValidate: function (callback, scope) {
				this.callParent([function (response) {
					if (!this.validateResponse(response)) {
						return;
					}

					Terrasoft.chain(
						function (next) {
							this.validateActiveAddBlockCount(function (response) {
								if (this.validateResponse(response)) {
									Ext.callback(callback, scope, [response]);
								}
							}, this);
						}, this);
				}, this]);
			},
          
          
          
          	/*
				Функция, проверяющая, превышает ли количество активных ежечасных рекламных блоков
				значение системной настройки "Максимальное число активных ежечасных выпусков".
			*/
			validateActiveAddBlockCount: function (callback, scope) {
				var result = {
					success: true
				};

				var periodicity = this.get("PeriodAddBlocks");

                var hourly = "a968a1bb-1079-488e-8a55-e8af9c09cb78";
				if (periodicity.value === hourly) {
					var limit = Terrasoft.SysSettings.getCachedSysSetting("MaxActiveRecords");

					var esqActiveHourlyAdvertisingBlock = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "RadioAdds"
					});
					esqActiveHourlyAdvertisingBlock.addColumn("Id");

					esqActiveHourlyAdvertisingBlock.filters.addItem(esqActiveHourlyAdvertisingBlock.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", this.get("Id")));

					esqActiveHourlyAdvertisingBlock.filters.addItem(esqActiveHourlyAdvertisingBlock.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "IsActive", true));

					esqActiveHourlyAdvertisingBlock.filters.addItem(esqActiveHourlyAdvertisingBlock.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "PeriodAddBlocks.Id", hourly));

					esqActiveHourlyAdvertisingBlock.getEntityCollection(function (response) {
						if (response.success) {
							if ((response.collection.getCount() >= limit) && (this.checkCurrentAddBlock())) {
								result.message = this.Ext.String.format(
									"В системе не может быть больше {0} активных ежечасных рекламных блоков!", limit);
								result.success = false;
							}
							Ext.callback(callback, scope, [result]);
						}
					}, this);
				} else {
					Ext.callback(callback, scope, [result]);
				}
			},
          
          	/*
				Функция, проверяющая, нужно ли учитывать текущую запись в подсчетах превышения лимита.
			*/
			checkCurrentAddBlock: function () {
				if ((this.$IsActive === true) &&
					(this.$PeriodAddBlocks.value === "a968a1bb-1079-488e-8a55-e8af9c09cb78")) {
					return true;
				} else {
					return false;
				}
			},
          
          	/*
				Функция, добавляющая действие onStartAddPublicationsByPeriodProcessClick в действия страницы
			*/
			getActions: function () {
				var actionMenuItems = this.callParent(arguments);
				actionMenuItems.addItem(this.getButtonMenuSeparator());
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Tag": "onStartAddPublicationsByPeriodProcessClick",
					"Caption": { "bindTo": "Resources.Strings.StartAddPublicationsByPeriodProcessActionCaption" }
				}));

				return actionMenuItems;
			},
          
          	onStartAddPublicationsByPeriodProcessClick: function () {
				var processConfig = {
					sysProcessName: "AddPublicationsByPeriod",
					parameters: {
						AdvertisingBlockId: this.get("Id"),
					}
				};

				ProcessModuleUtilities.executeProcess(processConfig);
			},
        },
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Name",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "Name"
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "IsActive",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "IsActive"
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Notes",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "Notes"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "Code",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "Header"
					},
					"bindTo": "Code"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Comment",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "Header"
					},
					"bindTo": "Comment"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "Obliged",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 3,
						"layoutName": "Header"
					},
					"bindTo": "Obliged"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "PeriodAddBlocks",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 4,
						"layoutName": "Header"
					},
					"bindTo": "PeriodAddBlocks"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "NotesAndFilesTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.NotesAndFilesTabCaption"
					},
					"items": [],
					"order": 0
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "SchemaPublicationsDetail",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 0
			}
		]/**SCHEMA_DIFF*/
	};
});
