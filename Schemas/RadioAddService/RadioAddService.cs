namespace Terrasoft.Configuration.RadioAddService
{
    using System;
	using System.Net;
	using System.Collections.Generic;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.ServiceModel.Activation;
	using System.Runtime.Serialization;
    using Terrasoft.Core;
    using Terrasoft.Common;
  	using Terrasoft.Configuration;
    using Terrasoft.Core.Factories;
    using Terrasoft.Core.DB;
    using Terrasoft.Core.Entities; 
    using Terrasoft.Web.Common;
	using Newtonsoft.Json;

    /// <summary>
    /// Сервис, предоставляющий методы для работы с классом "Рекламный блок" (RadioAdds)
    /// </summary>
    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    public class RadioAddsService: BaseService
    {
        /// <summary>
		/// Вызываемый метод сервиса, который запускает проверку, существует ли рекламный блок по Коду.
		/// Если существует, то запускает функцию подсчета суммы для связанных Выпусков и возвращает итог.
		/// Если не существует, то возвращает '-1'.
		/// </summary>
		/// <param name="RadioAddCode">Код "Рекламного блока", для которого вычисляется сумма.</param>
		/// <returns></returns>
        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, 
            BodyStyle = WebMessageBodyStyle.Wrapped, ResponseFormat = WebMessageFormat.Json)]
        public string GetSumForSessionsByAddBlockCode(string RadioAddCode) 
        {        
        	return (CheckAddBlockExists(RadioAddCode) == true ? 
               CalculateSumForReleasesByAdCode(RadioAddCode).ToString() : "-1");
        }
        
        /// <summary>
		/// Метод, проверяющий, существует ли рекламный блок с Кодом DomAdvertisingBlockCode.
		/// </summary>
		/// <param name="RadioAddCode">Код "Рекламного блока", для которого производится проверка.</param>
		/// <returns>true - Рекламный блок существует, false - не существует.</returns>              
        private bool CheckAddBlockExists(string RadioAddCode) 
        {
        	var esqFindAdvertisingBlock = new EntitySchemaQuery(UserConnection.EntitySchemaManager, "RadioAdds");
            esqFindAdvertisingBlock.AddColumn("Id");
            
            var codeFilter = esqFindAdvertisingBlock.CreateFilterWithParameters(FilterComparisonType.Equal, 
            	"Code", RadioAddCode);
                
            esqFindAdvertisingBlock.Filters.Add(codeFilter);
            
            var collection = esqFindAdvertisingBlock.GetEntityCollection(UserConnection);
            
            return (collection.Count > 0)?true:false;
        }
        
        /// <summary>
		/// Метод, вычисляющий сумму стоимости для всех завершенных выпусков, связанных с Рекламным блоком,
        /// которому соответствует входящий Код DomAdvertisingBlockCode.
		/// </summary>
		/// <param name="RadioAddCode">Код "Рекламного блока", для которого вычисляется сумма.</param>
		/// <returns>Сумма стоимости для всех завершенных Выпусков.</returns>        
        private double CalculateSumForReleasesByAdCode(string RadioAddCode) 
        {
            var esqSumForSessionPricesByAddBlockCode = new EntitySchemaQuery(UserConnection.EntitySchemaManager, "Publications");
            
            var totalSumColumn = esqSumForSessionPricesByAddBlockCode.AddColumn("Price");
            totalSumColumn.SummaryType = AggregationType.Sum;

            var esqCodeFilter = esqSumForSessionPricesByAddBlockCode.CreateFilterWithParameters(FilterComparisonType.Equal, 
            	"RadioAdd.Code", RadioAddCode);
            esqSumForSessionPricesByAddBlockCode.Filters.Add(esqCodeFilter);
            
            var esqReleaseStateFilter = esqSumForSessionPricesByAddBlockCode.CreateFilterWithParameters(FilterComparisonType.Equal, 
            	"PublicationStatus", DomConstantsCs.SessionState.Completed);
            esqSumForSessionPricesByAddBlockCode.Filters.Add(esqReleaseStateFilter);
            
            double totalSum = 0.0;
            var summaryEntity = esqSumForSessionPricesByAddBlockCode.GetSummaryEntity(UserConnection);            
            if (summaryEntity != null)
            {
            	totalSum = Convert.ToDouble(summaryEntity.GetColumnValue(totalSumColumn.Name));             
            }            
            
            return totalSum;       
        }
    }  
}